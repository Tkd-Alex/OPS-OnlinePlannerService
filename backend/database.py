import datetime
from peewee import MySQLDatabase, Model, CharField, AutoField, DateTimeField, BooleanField

db = MySQLDatabase('ops', user='root', password='root', host='127.0.0.1', port=3306)


class BaseModel(Model):
    class Meta:
        database = db


class User(BaseModel):
    user_id = AutoField()
    username = CharField(unique=True)
    email = CharField(unique=True)
    fullname = CharField()
    password = CharField()
    created_date = DateTimeField(default=datetime.datetime.now)
    is_admin = BooleanField(default=False)
