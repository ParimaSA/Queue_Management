from typing import Optional
from datetime import datetime
from ninja import Schema, ModelSchema
from .models import Business


class BusinessSchema(ModelSchema):
    class Meta:
        model = Business
        fields = ('user', 'name')


class QueueDetailSchema(Schema):
    id: int
    name: str


class QueueSchema(Schema):
    # GET
    id: int
    name: str
    estimated_time: Optional[int]


class EntryDetailCustomerSchema(Schema):
    id: int
    name: str
    queue: QueueSchema
    business: str
    tracking_code: Optional[str]
    time_in: datetime
    time_out: Optional[datetime]
    status: str = "waiting"
    queue_ahead: int


class EntryDetailSchema(Schema):
    id: int
    name: str
    queue: QueueSchema
    business: BusinessSchema
    tracking_code: Optional[str]
    time_in: datetime
    time_out: Optional[datetime]
    status: str = "waiting"


class EditIn(Schema):
    name: str
    prefix: str


class CustomerQueueCreateSchema(Schema):
    tracking_code: str


class QueueCreateSchema(Schema):
    name: str
    prefix: str
