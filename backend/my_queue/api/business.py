"""Api routes for business."""

from typing import List

from ..forms import SignUpForm
from ..models import Queue, Business
from ..schemas import (
    BusinessRegisterSchema,
    EmailBusinessRegisterSchema,
    QueueDetailSchema,
    QueueCreateSchema,
    BusinessDataSchema,
    BusinessUpdatedSchema,
)
from django.conf import settings
import helpers
from django.http import JsonResponse
from ninja_extra import api_controller, http_get, http_post, http_put
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from ninja import File
from django.core.files.base import ContentFile
from ninja.files import UploadedFile

DEFAULT_PROFILE_IMAGE_NAME = "profiles/default.png"
S3_BUCKET_NAME = settings.AWS_STORAGE_BUCKET_NAME


@api_controller("/business")
class BusinessController:
    """Controller for managing business-related endpoints."""

    @http_get("",
              response=List[BusinessDataSchema] | None,
              auth=helpers.api_auth_user_required)
    def my_business(self, request):
        """Return information of the business."""
        my_business = Business.objects.filter(user=request.user)
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
            Business.objects.create(
                user=new_user, name=data_dict["business_name"])
            return {'msg': 'Business account is successfully created.'}
        else:
            error_details = form.errors.as_json()
            return {'msg': "Can not create this account", "error": error_details}

    @http_post("/queues", response=dict, auth=helpers.api_auth_user_required)
    def create_business_queue(self, request, data: QueueCreateSchema):
        """Create new queue for business."""
        data_dict = data.dict()
        business = Business.objects.get(user=request.user)
        if business.queue_set.all().count() >= 16:
            return {"error": "The maximum number of queue you can create is 16."}
        same_queue_name = Queue.objects.filter(
            business=business, name=data_dict["name"])
        if same_queue_name.count() > 0:
            return {"error": f"Queue with name {data_dict['name']} already exist."}

        if len(data_dict.get("prefix", "")) > 1:
            return {"error": "The prefix must be a single character."}

        new_queue = Queue.objects.create(business=business, **data_dict)
        new_queue.save()
        return {"msg": f"Queue {new_queue.name} is successfully created."}

    @http_post("/email-register", response=dict, auth=helpers.api_auth_user_or_guest)
    def oauth_business_register(self, request, data: EmailBusinessRegisterSchema):
        """Register new business user."""
        data_dict = data.dict()
        email = data_dict["email"]
        if not email:
            return {"error": "Email is required"}

        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(email=email, username=email)
            user.save()
            Business.objects.create(user=user, name="BusinessName")
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return {'access_token': str(access_token), 'refresh_token': str(refresh)}

    @http_put("/business_updated", auth=helpers.api_auth_user_required)
    def edit_business(self, request, edit_attrs: BusinessUpdatedSchema):
        """Edit details of the business."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "Cannot edit this business."}, status=404)
        for attr, value in edit_attrs.dict().items():
            setattr(business, attr, value)
        business.save()
        return JsonResponse(
            {
                "msg": f"Successfully updated the details of '{business.name}'."
            },
            status=200,
        )

    @http_get(
        "/queues", response=List[QueueDetailSchema], auth=helpers.api_auth_user_required
    )
    def get_business_queues(self, request):
        """Return list of all queues in the business."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        queue_list = Queue.objects.filter(business=business).order_by("id")
        return queue_list

    @http_get("/profile", response=dict, auth=helpers.api_auth_user_required)
    def get_profile_image(self, request):
        """Return the profile image of the business."""
        try:
            business = Business.objects.get(user=request.user)
            image_url = business.profile_image_url
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        return {"image": image_url}

    @http_post("/profile", response=dict, auth=helpers.api_auth_user_required)
    def upload_profile_image(self, request, file: UploadedFile = File(...)):
        """Upload profile image for business."""
        file = request.FILES['file']
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)

        # Delete the old profile image if it exists
        if business.image and business.image.name != DEFAULT_PROFILE_IMAGE_NAME:
            # Delete from storage (handled by S3)
            business.image.delete(save=False)

        business.image.save(file.name, ContentFile(file.read()), save=True)

        image_url = request.build_absolute_uri(business.image.url)  # Full URL
        return {
            "msg": f"{file.name} uploaded.",
            "business": image_url  # This will return the correct URL
        }
