#!/usr/bin/python3
# -*- coding: utf-8 -*-

import datetime
import json
import re
import bcrypt

import utils

from flask import Flask, make_response
from flask_cors import CORS
from flask_restful import Resource, Api, reqparse
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

from werkzeug.security import safe_str_cmp

from database import db, User

app = Flask(__name__)
CORS(app)

api = Api(app, prefix="/api/v1")

app.config['JWT_SECRET_KEY'] = 'lxVYbvu7ZwFNlt1gkx9K'
jwt = JWTManager(app)

SALT = b'$2b$10$UikBBmN7A0dv7WFcxD.8uO'


@app.errorhandler(Exception)
def handle_error(e):
    return {"message": "Exception raised: {}".format(e)}, 500


@api.representation('application/json')
def output_json(data, code, headers=None):
    resp = make_response(json.dumps(data, cls=utils.JSONEncoder), code)
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
        args["fullname"] = [word.title().strip() for word in args["fullname"].split(" ")]

        if args['password1'] != args['password2']:
            return {"message": "Le password inserite non coincidono"}, 400

        regex_passw = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,20}$'
        regex_email = '^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$'

        """
        - Should have at least one number.
        - Should have at least one uppercase and one lowercase character.
        - Should have at least one special symbol.
        - Should be between 6 to 20 characters long.
        """
        if re.search(regex_passw, args["password1"]):
            return {"message": "La password deve contenere almeno un numero, un carattere speciale, caratteri misti (upper, lower) e deve comprendere tra i 6 e i 20 caratteri"}, 400

        if re.search(regex_email, args["email"]):
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
            return {'message': 'Login effettuato con successo!', 'user': utils.peewee_to_dict(user), 'token': access_token}, 200
        else:
            return {'message': 'Credenziali errata. Assicurati che username e password siano corretti'}, 400


class UserIdentity(Resource):
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        current_user = json.loads(current_user)
        user = User.get_or_none(User.username == current_user["username"] and User.user_id == current_user["user_id"])
        return utils.peewee_to_dict(user), 200


api.add_resource(UserRegistration, '/user/register')
api.add_resource(UserLogin, '/user/login')
api.add_resource(UserIdentity, '/user')


if __name__ == '__main__':
    db.connect()
    db.create_tables([User])

    app.run(host="0.0.0.0", port=123456, threaded=True, debug=True)
