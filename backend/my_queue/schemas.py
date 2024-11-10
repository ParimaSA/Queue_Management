"""Schemas for api endpoints."""

from typing import Optional
from datetime import datetime
from ninja import Schema, ModelSchema
from .models import Business


class BusinessSchema(ModelSchema):
    """Schema for the Business model."""

    class Meta:
        model = Business
        fields = ("user", "name")


class BusinessRegisterSchema(Schema):
    username: str
    password1: str
    password2: str
    business_name: str


class EmailBusinessRegisterSchema(Schema):
    email: str


class QueueDetailSchema(Schema):
    """Schema for Queue model."""

    id: int
    name: str


class QueueSchema(Schema):
    """Schema for queue-related get method."""

    id: int
    name: str
    estimated_time: Optional[int]


class EntryDetailCustomerSchema(Schema):
    """Schema for detailed entry information, including queue ahead."""

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
    """Schema for detailed entry information."""

    id: int
    name: str
    queue: QueueSchema
    business: BusinessSchema
    tracking_code: Optional[str]
    time_in: datetime
    time_out: Optional[datetime]
    status: str = "waiting"


class EditIn(Schema):
    """Schema for editing queue information."""

    name: str
    prefix: str


class CustomerQueueCreateSchema(Schema):
    """Schema for customer when add tracking code."""

    tracking_code: str


class QueueCreateSchema(Schema):
    """Schema for creating a new queue."""

    name: str
    prefix: str
