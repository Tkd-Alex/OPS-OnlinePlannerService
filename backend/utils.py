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


def peewee_to_dict(model):
    model = model_to_dict(model)
    if "password" in model:
        del model["password"]
    return model
