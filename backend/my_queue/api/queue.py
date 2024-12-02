"""Api routes for queue."""
from datetime import datetime
from typing import List
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ..models import Queue, Business, Entry
from ..schemas import (
    QueueDetailSchema,
    EditIn,
    EntryDetailSchema,
)
from django.conf import settings
import helpers
from django.http import JsonResponse
from ninja_extra import api_controller, http_get, http_post, http_put, http_delete

DEFAULT_PROFILE_IMAGE_NAME = "profiles/default.png"
S3_BUCKET_NAME = settings.AWS_STORAGE_BUCKET_NAME


@api_controller("/queue")
class QueueController:
    """Controller for managing queue-related endpoints."""

    @http_get("/last-entry", auth=helpers.api_auth_user_required)
    def get_last_entry(self, request):
        """Return last entry for each queue."""
        queues = Queue.objects.filter(business__user=request.user).order_by("id")
        date = datetime.today().date()
        last_entry_for_each_queue = []
        for queue in queues:
            last_entry = queue.entry_set.filter(status="completed",
                                                time_in__date=date).order_by("time_out")
            if last_entry:
                last_entry = last_entry[last_entry.count()-1].name
            else:
                last_entry = "-"
            last_entry_for_each_queue.append({"name": queue.name,
                                              "last_entry": last_entry})
        return last_entry_for_each_queue

    @http_get("/detail/{queue_id}",
              response=QueueDetailSchema,
              auth=helpers.api_auth_user_required)
    def get_queue_detail(self, request, queue_id: int):
        """Return detail of a specified queue."""
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(pk=queue_id, business=business)
        except Queue.DoesNotExist:
            return {'error': 'This queue is not belong to your business.'}
        return queue

    @http_put("/edit/{queue_id}", auth=helpers.api_auth_user_required)
    def edit_queue(self, request, queue_id: int, edit_attrs: EditIn):
        """Edit queue to the specified business."""
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

    @http_delete("/delete/{queue_id}", auth=helpers.api_auth_user_required)
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

    @http_post("/new-entry/{queue_id}",
               response=dict,
               auth=helpers.api_auth_user_required)
    def add_entry_to_queue(self, request, queue_id: int):
        """Adding new entry into the queue."""
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(business=business, pk=queue_id)
        except Queue.DoesNotExist:
            return {'error': 'This queue not belong to your business.'}

        waiting_entry = Entry.objects.filter(queue=queue, status="waiting")
        if waiting_entry.count() >= 15:
            return {'error': 'There are 15 people waiting in this queue. '
                             'Please clear the queue before adding new entry.'}

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
        queue = get_object_or_404(
            Queue, business__user=request.user, pk=queue_id)
        entry = Entry.objects.filter(
            queue=queue, status="waiting", time_in__date=today
        ).order_by("time_in")
        return entry[:5]
