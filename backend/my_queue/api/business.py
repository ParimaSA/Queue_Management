"""Api routes for business."""

import helpers
from django.http import JsonResponse
from ninja_extra import api_controller, http_get, http_post
from ..schemas import (
    BusinessSchema,
    BusinessRegisterSchema,
    QueueDetailSchema,
    QueueCreateSchema,
)
from ..models import Queue, Business
from ..forms import SignUpForm
from typing import List


@api_controller("/business")
class BusinessController:
    """Controller for managing business-related endpoints."""

    @http_get("", response=BusinessSchema | None, auth=helpers.api_auth_user_required)
    def my_business(self, request):
        """Return information of the business."""
        try:
            my_business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        return my_business

    @http_post("/register", response=dict, auth=helpers.api_auth_user_or_guest)
    def business_register(self, request, data: BusinessRegisterSchema):
        """Register new business user."""
        data_dict = data.dict()
        signup_user = {"username": data_dict["username"],
                       "password1": data_dict["password1"],
                       "password2": data_dict["password2"]}
        form = SignUpForm(signup_user)
        if form.is_valid():
            new_user = form.save()
            Business.objects.create(user=new_user, name=data_dict["business_name"])
            return {'msg': 'Business account is successfully created.'}
        else:
            error_details = form.errors.as_json()
            return {'msg': "Can not create this account", "error": error_details}

    @http_get(
        "/queues", response=List[QueueDetailSchema], auth=helpers.api_auth_user_required
    )
    def get_business_queues(self, request):
        """Return list of all queues in the business."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        queue_list = Queue.objects.filter(business=business)
        return queue_list

    @http_post("/queues", response=dict, auth=helpers.api_auth_user_required)
    def create_business_queue(self, request, data: QueueCreateSchema):
        """Create new queue for business."""
        data_dict = data.dict()
        business = Business.objects.get(user=request.user)
        all_alphabet = Queue.objects.filter(business=business).values_list(
            "prefix", flat=True
        )
        if data_dict["prefix"] in all_alphabet:
            return {"msg": "This prefix has been used."}
        new_queue = Queue.objects.create(business=business, **data_dict)
        new_queue.save()
        return {"msg": f"Queue {new_queue.name} is successfully created."}
