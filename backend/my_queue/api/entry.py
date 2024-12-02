"""Api routes for entry."""
import helpers
import math
from ..models import Business, Entry
from ..schemas import (EntryDetailSchema,
                       EntryDetailCustomerSchema,
                       CustomerQueueCreateSchema)
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import F, ExpressionWrapper, DurationField, Avg
from ninja_extra import api_controller, http_get, http_post


@api_controller("/entry")
class EntryController:
    """Controller for managing entry-related endpoints."""

    @staticmethod
    def calculate_estimate_waiting_time(entry, entry_ahead):
        """Calculate estimate waiting time for entry."""
        queue = entry.queue
        entries = Entry.objects.filter(queue=queue,
                                       time_out__isnull=False,
                                       status="completed")
        entries = entries.annotate(
            waiting_time=ExpressionWrapper(
                F('time_out') - F('time_in'),
                output_field=DurationField()
            )
        )
        average_waiting_time = entries.aggregate(average_waiting_time=Avg('waiting_time'))
        average_waiting_time = average_waiting_time['average_waiting_time']
        if average_waiting_time is not None:
            return math.ceil(average_waiting_time.total_seconds() / 60) * entry_ahead
        return -1

    def serialize_single_entry(self, entry):
        """Serialize json for entry."""
        queue_ahead = entry.get_queue_position()
        estimate_waiting = self.calculate_estimate_waiting_time(entry, queue_ahead)
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
            estimate_waiting_time=estimate_waiting
        )
        return entry_detail

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
        """Mark a specific entry as completed."""
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
        return [self.serialize_single_entry(my_entry)]
