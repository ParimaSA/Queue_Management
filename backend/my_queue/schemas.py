from typing import Optional
from datetime import datetime
from ninja import Schema, ModelSchema
from .models import Business


class BusinessSchema(ModelSchema):
    class Meta:
        model = Business
        fields = ('user', 'name')


class BusinessRegisterSchema(Schema):
    username: str
    password1: str
    password2: str
    business_name: str


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


class EntryDetailSchema2(Schema):
    id: int                    # Auto-generated ID
    name: str                   # Name of the entry
    queue:QueueSchema     # ForeignKey to Queue
    business: BusinessSchema  # ForeignKey to Business (optional)
    tracking_code: Optional[str]
    time_in: datetime             # Time in (auto-populated)
    time_out: Optional[datetime]  # Time out (optional)
    status: str = "waiting"


class EditIn(Schema):
    name: str
    alphabet: str


class CustomerQueueCreateSchema(Schema):
    tracking_code: str


class QueueCreateSchema(Schema):
    name: str
    alphabet: str
