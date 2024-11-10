"""Api route for queue."""

import helpers
from django.http import JsonResponse
from ninja_extra import api_controller, http_get, http_post, http_put, http_delete
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ..schemas import (
    EntryDetailSchema,
    EditIn,
)
from ..models import Entry, Business, Queue
from typing import List


@api_controller("/queue")
class QueueController:
    """Controller for managing queue-related endpoints."""

    @http_put("/{queue_id}", auth=helpers.api_auth_user_required)
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

    @http_post("/new-entry/{queue_id}", auth=helpers.api_auth_user_required)
    def add_entry_to_queue(self, request, queue_id: int):
        """Adding new entry into the queue."""
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(business=business, pk=queue_id)
        except Queue.DoesNotExist:
            return JsonResponse({"msg": "This queue does not exist"}, status=404)

        new_entry = Entry.objects.create(
            business=business, queue=queue, status="waiting"
        )
        return JsonResponse(
            {
                "msg": f"New entry successfully added to queue {queue.name}.",
                "tracking_code": new_entry.tracking_code,
            },
            status=200,
        )

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
        return entry
