import json
import datetime

from playhouse.shortcuts import model_to_dict
from database import User, Business, Service, OwnerBusiness, Reservation, ReservationService


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if (
            isinstance(o, datetime.datetime)
            or isinstance(o, datetime.date)
        ):
            return str(o)
        return json.JSONEncoder.default(self, o)


def services_upsert(args, current_user, action="update"):
    if args["name"] == "":
        return {'message': "Inserisci il nome del servizio per proseguire"}, 400

    if args["price"] < 0:
        return {'message': "Il prezzo del servizio non puo' essere minore di 0 Eur"}, 400

    if OwnerBusiness.get_or_none((OwnerBusiness.user_id == current_user["user_id"]) & (OwnerBusiness.business_id == args["business_id"])) is not None:
        update = {}
        for name in ["name", "description", "price", "business_id", "duration_m"]:
            if args[name] is not None:
                update[name] = args[name]

        if action == "update":
            query = Service.update(update).where(Service.service_id == args["id"] and Service.business == args["business_id"])
            if query.execute() != 0:
                update["updated_date"] = datetime.datetime.now()
                update["updated_by"] = current_user["user_id"]

                service = Service.get_or_none(Service.service_id == args["id"] and Service.business == args["business_id"])
                service = model_to_dict(service, recurse=True, backrefs=True, max_depth=1, exclude=[User.password, Business.time_table])
                return service, 200
        else:
            update["created_by_id"] = current_user["user_id"]
            update["updated_by_id"] = current_user["user_id"]
            service = Service.create(**update)
            service = model_to_dict(service, recurse=True, backrefs=True, max_depth=1, exclude=[User.password, Business.time_table])
            return service, 200
    else:
        return {'message': "Impossibile eseguire, sei sicuro di avere i permessi per eseguire queta operazione?"}, 400


def is_valid_date(day, date):
    for amorpm in ["morning", "afternoon"]:
        if day[amorpm]["open"] is None and day[amorpm]["close"] is None:
            continue

        _open_ = datetime.datetime.strptime("{} {}".format(date.strftime("%Y-%m-%d"), day[amorpm]["open"]), '%Y-%m-%d %H:%M')
        _close = datetime.datetime.strptime("{} {}".format(date.strftime("%Y-%m-%d"), day[amorpm]["close"]), '%Y-%m-%d %H:%M')

        if _open_ <= date <= _close:
            return True

    return False
