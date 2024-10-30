from importlib.metadata import entry_points
import helpers
from ninja_extra import api_controller, http_get, http_post, http_put
from django.utils import timezone
from .schemas import CustomerQueueCreateSchema, EntryDetailSchema, QueueSchema, BusinessSchema, EditIn, QueueDetailSchema
from .models import Entry, Business, Queue
from typing import List, Union


def serialize_queue_entry(entry_list):
    """Get a serialized entry list with the number of queues ahead."""
    serialized_entries = []
    if len(entry_list) == 0:
        return []
    if len(entry_list) == 1:
        return serialize_single_entry(entry_list)
    for entry in entry_list:
        entry_detail = serialize_single_entry(entry)
        serialized_entries.append(entry_detail)
    return serialized_entries


def serialize_single_entry(entry):
    queue_ahead = entry.get_queue_position() 
    entry_detail = EntryDetailSchema(
        id=entry.id,
        name=entry.name,
        queue=entry.queue,
        business=entry.business.name,
        tracking_code=entry.tracking_code,
        time_in=entry.time_in,
        time_out=entry.time_out,
        status=entry.status,
        queue_ahead=queue_ahead
    )

    return entry_detail


@api_controller("/business")
class BusinessController:
    """Controller for managing business-related endpoints."""

    @http_get("my-business/", response=BusinessSchema | None)
    def my_business(self, request):
        """Return information of the business."""
        # print(request.user)
        if request.user.is_anonymous or request.user.is_superuser:
            # print('anonymous')
            return None
        return Business.objects.get(user=request.user)

    @http_get("get_entry/{entry_id}", response=EntryDetailSchema | None)
    def get_entry(self, request, entry_id: int):
        """Get information of a specific entry."""
        try:
            entry = Entry.objects.get(pk=entry_id)
        except Entry.DoesNotExist:
            return None
        return serialize_single_entry(entry)

    @http_get("queue/", response=List[QueueDetailSchema], auth=helpers.api_auth_user_required)
    def get_business_queues(self, request):
        """Return list of all queues in the business."""
        # return Queue.objects.all()
        business = Business.objects.get(user=request.user)
        queue_list = Queue.objects.filter(business=business)
        return queue_list

    @http_get("all-customers-entries/", response=dict, auth=helpers.api_auth_user_required)
    def get_all_entries(request):
        """Show all my business entries."""
        today = timezone.now().date()
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return {"detail": "Business not found"}, 404
        queue_list = Queue.objects.filter(business=business)
        entry_list = Entry.objects.filter(
            business=business,
            time_in__date=today,
        ).order_by("time_in")

        serialized_queues = [QueueSchema.from_orm(queue) for queue in queue_list]
        serialized_entries = serialize_queue_entry(entry_list)

        # Serialize the business object
        serialized_business = BusinessSchema.from_orm(business)

        return {
            "queues": serialized_queues,
            "entries": serialized_entries,
            "business": serialized_business
        }


@api_controller("/queue")
class QueueController:
    """Controller for managing queue-related endpoints."""

    @http_put("editQueue/{queue_id}", auth=helpers.api_auth_user_required)
    def edit_queue(self, request, queue_id: int, edit_attrs: EditIn):
        """
        Edit queue to the specified business.
        Args:
            request: The HTTP request object.
            queue_id: The primary key of the queue.
        Returns: message indicate whether the queue is successfully edit or not
        """
        print(request.user)
        business = Business.objects.get(user=request.user)
        try:
            queue = Queue.objects.get(pk=queue_id, business=business)
        except Queue.DoesNotExist:
            return {'msg': 'Cannot edit this queue.'}
        for attr, value in edit_attrs.dict().items():
            setattr(queue, attr, value)
        queue.save()
        return {'msg': f"Successfully updated the queue '{queue.name}' "
                       f"with the alphabet '{queue.alphabet}'."}


@api_controller("/entry")
class EntryController:
    """Controller for managing entry-related endpoints."""

    @http_post("cancel-queue/{entry_id}", response=dict, auth=helpers.api_auth_user_required)
    def cancel_queue(request, entry_id: int):
        """When the queue is canceled, the entry is also cancel."""
        try:
            my_entry = Entry.objects.get(entry__id=entry_id)
            if my_entry.entry.status != "waiting":
                return {"msg": "You cannot to cancel this entry."}
        except Entry.DoesNotExist:
            return {"msg": "Invalid entry id."}
        my_entry.delete()
        return {"msg": "Successfully canceled an entry."}

    @http_post("{pk}/runQueue", auth=helpers.api_auth_user_required)
    def run_queue(request, pk: int):
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
            entry = Entry.objects.get(pk=pk, business=business)
        except Entry.DoesNotExist:
            return {'msg': 'Deletion failed.'}

        entry.mark_as_completed()
        return {'msg': f'{entry.name} marked as completed.'}

    @http_post("add-trackcode/{tracking_code}", response=list[EntryDetailSchema] | dict)
    def add_customer_queue(request, tracking_code: CustomerQueueCreateSchema):
        """Add a queue to the customer queue."""

        try:
            # Check if the tracking code is valid
            my_entry = Entry.objects.get(tracking_code=tracking_code.tracking_code)
        except Entry.DoesNotExist:
            return {"msg": "Invalid track code"}
        return [serialize_single_entry(my_entry)]
