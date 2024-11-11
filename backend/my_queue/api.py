"""Api routes for business and customer."""

import helpers
import math
from datetime import timedelta, datetime
from django.http import JsonResponse
from ninja_extra import api_controller, http_get, http_post, http_put, http_delete
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Min, Max
from django.db.models.functions import TruncTime
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from ninja import File
from django.core.files.base import ContentFile
from ninja.files import UploadedFile
from .schemas import (
    CustomerQueueCreateSchema,
    EntryDetailSchema,
    BusinessSchema,
    BusinessRegisterSchema,
    EmailBusinessRegisterSchema,
    EditIn,
    QueueDetailSchema,
    EntryDetailCustomerSchema,
    QueueCreateSchema,
    BusinessDataSchema,
    BusinessUpdatedSchema,
)
from .models import Entry, Business, Queue
from .forms import SignUpForm
from typing import List


def serialize_single_entry(entry):
    """Serialize json for entry."""
    queue_ahead = entry.get_queue_position()
    entry_detail = EntryDetailCustomerSchema(
        id=entry.id,
        name=entry.name,
        queue=entry.queue,
        business=entry.business.name,
        tracking_code=entry.tracking_code,
        time_in=entry.time_in,
        time_out=entry.time_out,
        status=entry.status,
        queue_ahead=queue_ahead,
    )

    return entry_detail


@api_controller("/business")
class BusinessController:
    """Controller for managing business-related endpoints."""

    @http_get("", response=List[BusinessDataSchema] | None, auth=helpers.api_auth_user_required)
    def my_business(self, request):
        """Return information of the business."""
        try:
            my_business = Business.objects.filter(user=request.user)
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

    @http_post("/queues", response=dict, auth=helpers.api_auth_user_required)
    def create_business_queue(self, request, data: QueueCreateSchema):
        """Create new queue for business."""
        data_dict = data.dict()
        business = Business.objects.get(user=request.user)
        same_queue_name = Queue.objects.filter(business=business, name=data_dict["name"])
        if same_queue_name.count() > 0:
            return {"error": f"Queue with name {data_dict["name"]} already exist."}
        new_queue = Queue.objects.create(business=business, **data_dict)
        new_queue.save()
        return {"msg": f"Queue {new_queue.name} is successfully created."}

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
    
    @http_get("/top_queues", response=List[QueueDetailSchema], auth=helpers.api_auth_user_required)
    def get_top_queue(self, request):
        """Return top 3 queues in the business."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        top_queue_list = Queue.objects.filter(business=business).annotate(entry_count=Count('entry')).order_by('-entry_count')[:3]
        return top_queue_list
    
    @http_get("/avg_weekly_entry", auth=helpers.api_auth_user_required)
    def get_average_weekly_entry(self, request):
        """Return a list of the average number of entries for each day of the week."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        
        try:
            queues = Queue.objects.filter(business=business)
        except Queue.DoesNotExist:
            return JsonResponse({"msg": "No queue found for this business."}, status=404)
        
        try:
            date_range = Entry.objects.filter(business=business, queue__in=queues
                                              ).aggregate(first_entry=Min("time_in"), 
                                                           last_entry=Max("time_in"))

            if date_range["first_entry"] is not None and date_range["last_entry"] is not None:
                first_entry = date_range["first_entry"]
                last_entry = date_range["last_entry"]
                total_week = ((last_entry - first_entry).days // 7) + 1
                
            weekly_entry = Entry.objects.filter(business=business, queue__in=queues
                                         ).values("time_in__week_day"
                                                  ).annotate(entry_count=Count("id"))
            avg_weekly_entry = []
            for entry in weekly_entry:
                avg_weekly_entry.append({"day":entry["time_in__week_day"], "entry_count": math.ceil(entry["entry_count"]/total_week)})
            return avg_weekly_entry
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "No entries found for this business queue."}, status=404)
        
    @http_get("/entry_in_time_slot", auth=helpers.api_auth_user_required)
    def get_entry_in_time_slot(self, request):
        """Return a list of the average number of entries in time slot."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        
        try:
            queues = Queue.objects.filter(business=business)
        except Queue.DoesNotExist:
            return JsonResponse({"msg": "No queue found for this business."}, status=404)
        
        try:
            entry = Entry.objects.filter(business=business, queue__in=queues)
            date_range = Entry.objects.filter(business=business, queue__in=queues
                                              ).aggregate(first_entry=Min("time_in"), 
                                                           last_entry=Max("time_in"))
            date = datetime.today().date()
            open_time = timezone.make_aware(datetime.combine(date, business.open_time))
            close_time = timezone.make_aware(datetime.combine(date, business.close_time))
            total_hours = math.ceil((close_time - open_time).total_seconds() / 3600)
            if date_range["first_entry"] is not None and date_range["last_entry"] is not None:
                first_entry = date_range["first_entry"]
                last_entry = date_range["last_entry"]
                total_week = ((last_entry - first_entry).days // 7) + 1
            
                time_slot_list = []
                for i in range(math.ceil(total_hours/2)):
                    start_time = open_time + timedelta(hours=2 * i)
                    end_time = start_time + timedelta(hours=2)

                    entry_in_slot = entry.annotate(time_in_time=TruncTime('time_in')).filter(
                        time_in_time__gte=start_time,
                        time_in_time__lt=end_time
                    )
                    num_entry_in_slot = math.ceil(entry_in_slot.count()/total_week)

                    time_slot_list.append({"start_time": start_time.hour, "entry_count": num_entry_in_slot})
                return time_slot_list
            
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "No entries found for this business queue."}, status=404)
        
    @http_put("/business_updated", auth=helpers.api_auth_user_required)
    def edit_business(self, request, edit_attrs: BusinessUpdatedSchema):
        """
        Edit deatils of the business.

        Args:
            request: The HTTP request object.
            queue_id: The primary key of the business.
        Returns: message indicate whether the business is successfully edit or not
        """
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
    
    @http_get("/profile", response=dict, auth=helpers.api_auth_user_required)
    def get_profile_image(self, request):
        """Return the profile image of the business."""
        print(request.user)
        try:
            business = Business.objects.get(user=request.user)
            image_url = request.build_absolute_uri(business.image.url)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        print("Image URL:", image_url)
        return {"image": image_url}
    

@api_controller("/queue")
class QueueController:
    """Controller for managing queue-related endpoints."""

    @http_get("/{queue_id}", response=QueueDetailSchema, auth=helpers.api_auth_user_required)
    def get_queue_detail(self, request, queue_id: int):
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(pk=queue_id, business=business)
        except Queue.DoesNotExist:
            return {'error': 'This queue is not belong to your business.'}
        return queue

    @http_put("/{queue_id}", auth=helpers.api_auth_user_required)
    def edit_queue(self, request, queue_id: int, edit_attrs: EditIn):
        """
        Edit queue to the specified business.

        Args:
            request: The HTTP request object.
            queue_id: The primary key of the queue.
        Returns: message indicate whether the queue is successfully edit or not
        """
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(pk=queue_id, business=business)
        except Queue.DoesNotExist:
            return JsonResponse({"msg": "Cannot edit this queue."}, status=404)
        for attr, value in edit_attrs.dict().items():
            setattr(queue, attr, value)
        queue.save()
        return JsonResponse(
            {
                "msg": f"Successfully updated the queue '{queue.name}'"
                       f" with the prefix '{queue.prefix}'."
            },
            status=200,
        )

    @http_delete("/{queue_id}", auth=helpers.api_auth_user_required)
    def delete_queue(self, request, queue_id: int):
        """Delete queue to the specific business."""
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(pk=queue_id, business=business)
            queue.delete()
        except Queue.DoesNotExist:
            return JsonResponse(
                {"msg": "Can't delete another business's queue"}, status=404
            )

    @http_post("/new-entry/{queue_id}", response=dict, auth=helpers.api_auth_user_required)
    def add_entry_to_queue(self, request, queue_id: int):
        """Adding new entry into the queue."""
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(business=business, pk=queue_id)
        except Queue.DoesNotExist:
            return {'error': 'This queue not belong to your business.'}

        new_entry = Entry.objects.create(
            business=business, queue=queue, status="waiting"
        )
        return {
            'business': business.name,
            'queue_name': queue.name,
            'time_in': new_entry.time_in.isoformat(),
            'name': new_entry.name,
            'tracking_code': new_entry.tracking_code,
            'queue_ahead': new_entry.get_queue_position()
        }

    @http_get(
        "/{queue_id}/entries",
        response=List[EntryDetailSchema],
        auth=helpers.api_auth_user_required,
    )
    def get_waiting_entry_in_queue(self, request, queue_id: int):
        """Return list of all today's waiting entries in this queue."""
        today = timezone.localdate()
        queue = get_object_or_404(Queue, business__user=request.user, pk=queue_id)
        entry = Entry.objects.filter(
            queue=queue, status="waiting", time_in__date=today
        ).order_by("time_in")
        return entry[:6]


@api_controller("/entry")
class EntryController:
    """Controller for managing entry-related endpoints."""

    @http_get("/{entry_id}", response=EntryDetailSchema | None)
    def get_entry(self, request, entry_id: int):
        """Get information of a specific entry."""
        try:
            entry = Entry.objects.get(pk=entry_id)
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "This entry does not exist."}, status=404)
        return entry

    @http_post("/{entry_id}/status/cancel", auth=helpers.api_auth_user_required)
    def cancel_entry(self, request, entry_id: int):
        """Cancel entry.(business)."""
        business = Business.objects.get(user=request.user)
        try:
            entry = Entry.objects.get(pk=entry_id, business=business)
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "This entry does not exist."}, status=404)

        entry.mark_as_cancel()
        return JsonResponse({"msg": f"{entry.name} marked as cancel."}, status=200)

    @http_post("/{entry_id}/status/complete", auth=helpers.api_auth_user_required)
    def run_queue(self, request, entry_id: int):
        """
        Mark a specific entry as completed.

        Args:
            request: The HTTP request object.
            pk: The primary key of the entry.

        Returns:
            A message indicating the status of the operation.
        """
        business = Business.objects.get(user=request.user)
        try:
            entry = Entry.objects.get(pk=entry_id, business=business)
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "Deletion failed."}, status=404)

        entry.mark_as_completed()
        return JsonResponse({"msg": f"{entry.name} marked as completed."}, status=200)

    @http_post("/tracking-code/{tracking_code}/cancel", response=dict)
    def cancel_tracking_code(self, request, tracking_code: str):
        """When the queue is canceled, the entry is also cancel.(customer)."""
        try:
            my_entry = Entry.objects.get(tracking_code=tracking_code)
            if my_entry.status != "waiting":
                return JsonResponse(
                    {"msg": "You cannot cancel this entry."}, status=400
                )
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "Invalid tracking code."}, status=404)
        my_entry.mark_as_cancel()
        return JsonResponse({"msg": "Successfully canceled an entry."}, status=200)

    @http_get(
        "/tracking-code/{tracking_code}",
        response=list[EntryDetailCustomerSchema] | dict,
    )
    def add_tracking_code(self, request, tracking_code: CustomerQueueCreateSchema):
        """Add a queue to the customer queue."""
        today = timezone.localdate()
        try:
            my_entry = Entry.objects.get(
                tracking_code=tracking_code.tracking_code, time_in__date=today
            )
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "Invalid tracking code"}, status=404)
        return [serialize_single_entry(my_entry)]
