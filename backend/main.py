#!/usr/bin/python3
# -*- coding: utf-8 -*-

import datetime
import json
import re
import bcrypt
import time
import code

import utils

from flask import Flask, make_response, request
from flask_cors import CORS
from flask_restful import Resource, Api, reqparse
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from werkzeug.security import safe_str_cmp

from playhouse.shortcuts import model_to_dict
from database import db, User, Business, Service, OwnerBusiness, Reservation, ReservationService

app = Flask(__name__)
CORS(app)

api = Api(app, prefix="/api/v1")

app.config['JWT_SECRET_KEY'] = 'lxVYbvu7ZwFNlt1gkx9K'
jwt = JWTManager(app)

SALT = b'$2b$10$UikBBmN7A0dv7WFcxD.8uO'


# @app.errorhandler(Exception)
# def handle_error(e):
#     return {"message": "Exception raised: {}".format(e)}, 500


@api.representation('application/json')
def output_json(data, status_code, headers=None):
    resp = make_response(json.dumps(data, cls=utils.JSONEncoder), status_code)
    resp.headers.extend(headers or {})
    return resp


@jwt.unauthorized_loader
def unauthorized_loader(expired_token):
    return {'message': 'Missing Authorization Header'}, 403


class UserRegistration(Resource):
    def post(self):

        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument("fullname", type=str, required=True)
        parser.add_argument("username", type=str, required=True)
        parser.add_argument("password1", type=str, required=True)
        parser.add_argument("password2", type=str, required=True)
        parser.add_argument("email", type=str, required=True)
        args = parser.parse_args()

        args["username"] = args["username"].lower().strip()
        args["email"] = args["email"].lower().strip()
        args["fullname"] = " ".join([word.title().strip() for word in args["fullname"].split(" ")])

        if args['password1'] != args['password2']:
            return {"message": "Le password inserite non coincidono"}, 400

        regex_passw = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,20}$'
        regex_email = '[\w\.-]+@[\w\.-]+(\.[\w]+)+'

        """
        - Should have at least one number.
        - Should have at least one uppercase and one lowercase character.
        - Should have at least one special symbol.
        - Should be between 6 to 20 characters long.
        """
        if re.search(regex_passw, args["password1"]) is None:
            return {"message": "La password deve contenere almeno un numero, un carattere speciale, caratteri misti (upper, lower) e deve comprendere tra i 6 e i 20 caratteri"}, 400

        if re.search(regex_email, args["email"]) is None:
            return {"message": "La mail inserita non sembra essere valida"}, 400

        if User.get_or_none(User.username == args["username"]) is not None:
            return {"message": "Un altro utente sta gia' utilizzando l'username: {}".format(args["username"])}, 400
        if User.get_or_none(User.email == args["email"]) is not None:
            return {"message": "Un altro utente sta gia' utilizzando la mail: {}".format(args["email"])}, 400

        hashed = bcrypt.hashpw(args["password1"].encode("utf-8"), SALT)
        User.create(
            username=args["username"],
            email=args["email"],
            fullname=args["fullname"],
            password=hashed
        )

        return {'message': 'L\'utente e\' stato creato con successo. Per favore accedi con le tua credenziali nella pagina dedicata'}, 200


class UserLogin(Resource):
    def post(self):

        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument("username", type=str, required=True)
        parser.add_argument("password", type=str, required=True)
        args = parser.parse_args()

        hashed = bcrypt.hashpw(args["password"].encode("utf-8"), SALT)
        user = User.get_or_none(User.username == args["username"].lower().strip())
        if user is not None and safe_str_cmp(user.password, hashed) is True:
            access_token = create_access_token(identity=json.dumps({
                "username": user.username,
                "user_id": user.user_id
            }), expires_delta=datetime.timedelta(days=60))
            return {'message': 'Login effettuato con successo!', 'user': model_to_dict(user, recurse=False, backrefs=False, exclude=[User.password]), 'token': access_token}, 200
        else:
            return {'message': 'Credenziali errata. Assicurati che username e password siano corretti'}, 400


class UserEndpoint(Resource):
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)
        user = User.get_or_none(User.username == current_user["username"] and User.user_id == int(current_user["user_id"]))
        return model_to_dict(user, recurse=False, backrefs=False, exclude=[User.password]), 200


class BusinessEndpoint(Resource):
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)
        business = Business.select().join(OwnerBusiness).where(OwnerBusiness.user_id == int(current_user["user_id"])).get()
        if business is not None:
            business = model_to_dict(business, recurse=False, backrefs=False)
            business['time_table'] = json.loads(business['time_table'])
        return business, 200

    @jwt_required
    def post(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)

        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument("id", type=str, required=True)
        argsname = ["name", "description", "address"]
        for name in argsname:
            parser.add_argument(name, type=str, required=False)
        args = parser.parse_args()

        args["timeTable"] = [] if "timeTable" not in request.get_json() else request.get_json()["timeTable"]

        for day in args["timeTable"]:
            for amorpm in ["morning", "afternoon"]:
                if day[amorpm]["open"] is None and day[amorpm]["close"] is None:
                    continue

                if (day[amorpm]["open"] is None and day[amorpm]["close"] is not None) or (day[amorpm]["open"] is not None and day[amorpm]["close"] is None):
                    return {'message': 'Ad ogni orario di chiusura deve corrispondere un orario di apertura e vice versa'}, 400

                # Too much keyword in code, user _ :)

                _today = datetime.datetime.now().strftime("%Y-%m-%d")
                _open_ = datetime.datetime.strptime("{} {}".format(_today, day[amorpm]["open"]), '%Y-%m-%d %H:%M')
                _close = datetime.datetime.strptime("{} {}".format(_today, day[amorpm]["close"]), '%Y-%m-%d %H:%M')

                if _open_ >= _close:
                    return {'message': 'L\'orario di apertura non puo\' avvenire dopo la chiusura'}, 400

                """
                if amorpm == "morning":
                    _min = datetime.datetime.strptime("{} {}".format(_today, "00:00"), '%Y-%m-%d %H:%M')
                    _max = datetime.datetime.strptime("{} {}".format(_today, "13:59"), '%Y-%m-%d %H:%M')
                else:
                    _min = datetime.datetime.strptime("{} {}".format(_today, "12:00"), '%Y-%m-%d %H:%M')
                    _max = datetime.datetime.strptime("{} {}".format(_today, "22:59"), '%Y-%m-%d %H:%M')

                if (not (_min <= _open_ <= _max)) or (not (_min <= _close <= _max)):
                    return {'message': 'Assicurati che gli orari orari inseriti per mattino e pomeriggio rispettino tale indicazione'}, 400
                """

        if OwnerBusiness.get_or_none(OwnerBusiness.business == int(args["id"]) and OwnerBusiness.user_id == int(current_user["user_id"])) is not None:
            update = {}
            for name in argsname:
                if args[name] is not None:
                    update[name] = args[name]
            if args["timeTable"] != []:
                update["time_table"] = json.dumps(args["timeTable"])

            query = Business.update(update).where(Business.business_id == int(args["id"]))
        else:
            return {'message': "Impossibile aggiornare, sei sicuro di avere i permessi per eseguire queta operazione?"}, 400

        if query.execute() != 0:
            business = Business.get_or_none(Business.business_id == int(args["id"]))
            business = model_to_dict(business, recurse=False, backrefs=False)
            business['time_table'] = json.loads(business['time_table'])
            return business, 200

        return {'message': "Non c'e' nulla da aggiornare"}, 400


class ServiceEndpoint(Resource):
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)
        query = (Service
                 .select(Service)
                 .join(OwnerBusiness, on=(OwnerBusiness.user_id == int(current_user["user_id"])))
                 .order_by(Service.created_date.desc())
                 .where(OwnerBusiness.user_id == int(current_user["user_id"])))

        services = [model_to_dict(item, recurse=True, backrefs=True, max_depth=1, exclude=[User.password, Business.time_table]) for item in query]
        return services, 200

    @jwt_required
    def put(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)

        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument("id", type=int, required=True)
        parser.add_argument("business_id", type=int, required=True)
        parser.add_argument("name", type=str, required=True)
        parser.add_argument("price", type=float, required=True)
        parser.add_argument("duration_m", type=float, required=False)
        parser.add_argument("description", type=str, required=False)
        args = parser.parse_args()

        return utils.services_upsert(args, current_user, action="update")

    @jwt_required
    def post(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)

        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument("business_id", type=int, required=True)
        parser.add_argument("name", type=str, required=True)
        parser.add_argument("price", type=float, required=True)
        parser.add_argument("duration_m", type=float, required=False)
        parser.add_argument("description", type=str, required=False)
        args = parser.parse_args()

        return utils.services_upsert(args, current_user, action="insert")

    @jwt_required
    def delete(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)

        args = {}
        for name in ["id", "business_id"]:
            arg = request.args.get(name)
            if arg in [None, ""] or arg.isdigit() is False:
                return {'message': "Argomento {} non valido".format(name)}, 400
            args[name] = arg

        if OwnerBusiness.get_or_none((OwnerBusiness.user_id == int(current_user["user_id"])) & (OwnerBusiness.business_id == int(args["business_id"]))) is not None:
            query = Service.delete().where((Service.service_id == int(args["id"])) & (Service.business == int(args["business_id"])))
            print(query.sql())
            if query.execute() == 0:
                return {'message': "Spiacenti, il servizio non e' stato trovato"}, 400
            else:
                return {'message': "Servizio cancellato con successo"}, 200
        else:
            return {'message': "Impossibile eseguire, sei sicuro di avere i permessi per eseguire queta operazione?"}, 400


class ReservationEndpoint(Resource):
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)

        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument("timestamp", type=int, required=False)
        parser.add_argument("business_id", type=int, required=True)
        args = parser.parse_args()

        timestamp = int(time.time()) if args["timestamp"] is None else args["timestamp"]
        in___date = datetime.datetime.fromtimestamp(timestamp) - datetime.timedelta(days=30)

        query = (Reservation.select().where((Reservation.business == args["business_id"]) & (Reservation.created_date >= in___date)))

        reservations = [model_to_dict(item, recurse=True, backrefs=True, max_depth=1, exclude=[User.password, Business.time_table]) for item in query]
        return reservations, 200


api.add_resource(UserRegistration, '/user/register')
api.add_resource(UserLogin, '/user/login')
api.add_resource(UserEndpoint, '/user')
api.add_resource(BusinessEndpoint, '/business')
api.add_resource(ServiceEndpoint, '/services')
api.add_resource(ReservationEndpoint, '/reservations')


if __name__ == '__main__':
    db.connect()
    db.create_tables([User, Business, Service, OwnerBusiness, Reservation, ReservationService])

    app.run(host="0.0.0.0", port=123456, threaded=True, debug=True)
