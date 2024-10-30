"""Api for the project."""

from ninja import NinjaAPI, Schema
from ninja_jwt.authentication import JWTAuth
from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController


api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)
