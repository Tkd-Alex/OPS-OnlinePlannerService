import json
import datetime

from playhouse.shortcuts import model_to_dict


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if (
            isinstance(o, datetime.datetime)
            or isinstance(o, datetime.date)
        ):
            return str(o)
        return json.JSONEncoder.default(self, o)


def services_upsert(args, current_user, OwnerBusiness, Service, action="update"):
    if args["name"] == "":
        return {'message': "Inserisci il nome del servizio per proseguire"}, 400

    if args["price"] < 0:
        return {'message': "Il prezzo del servizio non puo' essere minore di 0 Eur"}, 400

    if OwnerBusiness.get_or_none(OwnerBusiness.user_id == current_user["user_id"] and OwnerBusiness.business_id == args["business_id"]) is not None:
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
                created_by_fullname = service.created_by.fullname
                updated_by_fullname = service.updated_by.fullname
                service = model_to_dict(service, recurse=False, backrefs=False, exclude=["password"])
                service["created_by"] = created_by_fullname
                service["updated_by"] = created_by_fullname
                return service, 200
        else:
            update["created_by_id"] = current_user["user_id"]
            update["updated_by_id"] = current_user["user_id"]
            service = Service.create(**update)
            created_by_fullname = service.created_by.fullname
            updated_by_fullname = service.updated_by.fullname
            service = model_to_dict(service, recurse=False, backrefs=False, exclude=["password"])
            service["created_by"] = created_by_fullname
            service["updated_by"] = updated_by_fullname
            return service, 200
    else:
        return {'message': "Impossibile eseguire, sei sicuro di avere i permessi per eseguire queta operazione?"}, 400
