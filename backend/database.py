import datetime
from peewee import MySQLDatabase, Model, CharField, AutoField, DateTimeField, TextField, BooleanField, ForeignKeyField, DoubleField, CompositeKey

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


class Business(BaseModel):
    business_id = AutoField()
    name = CharField(unique=True)
    description = TextField(null=True)
    address = TextField()
    time_table = TextField()  # Will be a JSON string :)


class Service(BaseModel):
    service_id = AutoField()
    name = CharField()
    price = DoubleField()
    description = TextField(null=True)
    created_date = DateTimeField(default=datetime.datetime.now)
    created_by = ForeignKeyField(User, backref='user')
    business = ForeignKeyField(Business, backref='business')


class OwnerBusiness(BaseModel):  # Many-to-many relationship.
    user = ForeignKeyField(User)
    business = ForeignKeyField(Business)

    class Meta:
        primary_key = CompositeKey('user', 'business')


class Reservation(BaseModel):
    reservation_id = AutoField()
    created_date = DateTimeField(default=datetime.datetime.now)
    planned = DateTimeField(default=datetime.datetime.now)
    note = TextField(null=True)
    is_approved = BooleanField(default=False)
    approved_by = ForeignKeyField(User, null=True, backref='user')
    is_reject = BooleanField(default=False)
    reject_by = ForeignKeyField(User, null=True, backref='user')
    customer = ForeignKeyField(User, backref='user')
    business = ForeignKeyField(Business, backref='business')


class ReservationService(BaseModel):
    reservation = ForeignKeyField(Reservation)
    service = ForeignKeyField(Service)

    class Meta:
        primary_key = CompositeKey('reservation', 'service')
