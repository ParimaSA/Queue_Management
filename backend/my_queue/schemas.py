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


class EntryDetailSchema(Schema):
    id: int
    name: str
    queue: QueueSchema
    business: str
    tracking_code: Optional[str]
    time_in: datetime
    time_out: Optional[datetime]
    status: str = "waiting"
    queue_ahead: int


class EditIn(Schema):
    name: str
    alphabet: str


class CustomerQueueCreateSchema(Schema):
    tracking_code: str