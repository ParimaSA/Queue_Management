"""Api for the project."""

from ninja import NinjaAPI, Schema
from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController
from my_queue.api import BusinessController, QueueController, EntryController, AnalyticController


api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)
api.register_controllers(BusinessController, QueueController, EntryController, AnalyticController)

class UserSchema(Schema):
    username: str
    is_authenticated: bool

@api.get("me/", response=UserSchema)
def who(request):
    return request.user