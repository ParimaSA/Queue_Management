"""Api routes for entry."""
from typing import List
import helpers
import math
from django.db.models.functions import TruncTime
from ..models import Business, Entry, Queue
from ..schemas import (QueueDetailSchema)
from datetime import timedelta, datetime
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import (F, ExpressionWrapper, DurationField,
                              Avg, Count, Sum, Min, Max)
from ninja_extra import api_controller, http_get


@api_controller("/analytic")
class AnalyticController:
    """Controller for managing analytic-related endpoints."""

    @http_get("/top-queue",
              response=List[QueueDetailSchema],
              auth=helpers.api_auth_user_required)
    def get_top_queue(self, request):
        """Return top 3 queues in the business."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)
        top_queue_list = Queue.objects.filter(business=business).annotate(
            entry_count=Count('entry')).order_by('-entry_count')[:3]
        return top_queue_list

    @http_get("/time-slot", auth=helpers.api_auth_user_required)
    def analytic_in_time_slot(self, request):
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
            entry = Entry.objects.filter(business=business,
                                         queue__in=queues,
                                         status="completed")
            date_range = (Entry.objects.filter(business=business, queue__in=queues))
            date_range = date_range.aggregate(first_entry=Min("time_in"),
                                              last_entry=Max("time_in"))

            date = datetime.today().date()
            open_time = timezone.make_aware(datetime.combine(date, business.open_time))
            close_time = timezone.make_aware(datetime.combine(date,
                                                              business.close_time))
            total_hours = math.ceil((close_time - open_time).total_seconds() / 3600)
            if (date_range["first_entry"] is not None and
                    date_range["last_entry"] is not None):
                time_slot_list = []
                for i in range(math.ceil(total_hours / 2)):
                    start_time = open_time + timedelta(hours=2 * i)
                    end_time = start_time + timedelta(hours=2)

                    entry_in_slot = entry.annotate(
                        time_in_time=TruncTime('time_in')).filter(
                        time_in_time__gte=start_time,
                        time_in_time__lt=end_time
                    )

                    entry_with_waiting_time = entry_in_slot.annotate(
                        waiting_time=ExpressionWrapper(
                            F('time_out') - F('time_in'),
                            output_field=DurationField()
                        )
                    )
                    total_waiting_time = entry_with_waiting_time.aggregate(
                        total_waiting_time=Sum('waiting_time')
                    )['total_waiting_time']

                    estimate_waiting_time = 0
                    if total_waiting_time:
                        total_second = total_waiting_time.total_seconds()
                        estimate_waiting_time = (total_second / entry_in_slot.count())

                    time_slot_list.append({"start_time": start_time.hour,
                                           "estimate_waiting": estimate_waiting_time / 60,
                                           "num_entry": entry_in_slot.count()})
                return time_slot_list

        except Entry.DoesNotExist:
            return JsonResponse({"msg": "No entries found for this business queue."},
                                status=404)

    @http_get("/weekly", auth=helpers.api_auth_user_required)
    def analytic_in_day(self, request):
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

            if (date_range["first_entry"] is not None and
                    date_range["last_entry"] is not None):
                first_entry = date_range["first_entry"]
                last_entry = date_range["last_entry"]
                total_week = ((last_entry - first_entry).days // 7) + 1

                entry = Entry.objects.filter(queue__in=queues,
                                             status="completed",
                                             time_out__isnull=False)

                weekly_entry = (entry.annotate(
                    waiting_time=ExpressionWrapper(
                        F('time_out') - F('time_in'),
                        output_field=DurationField()
                    )
                ).values("time_in__week_day"))

                weekly_entry = weekly_entry.annotate(avg_waiting_time=Avg("waiting_time"),
                                                     entry_count=Count("id"))
                avg_weekly_entry = []
                for day_entry in weekly_entry:
                    entry_count = math.ceil(day_entry["entry_count"] / total_week)
                    waiting_time = 0
                    if day_entry["avg_waiting_time"]:
                        waiting_time = day_entry["avg_waiting_time"].total_seconds() / 60
                    avg_weekly_entry.append({"day": day_entry["time_in__week_day"],
                                             "entry_count": entry_count,
                                             "waiting_time": waiting_time})
                return avg_weekly_entry
        except Entry.DoesNotExist:
            return JsonResponse({"msg": "No entries found for this business queue."},
                                status=404)

    @http_get("/queue", auth=helpers.api_auth_user_required)
    def analytic_in_queue(self, request):
        """Return a list of number of entries and average waiting time for each queue."""
        try:
            business = Business.objects.get(user=request.user)
        except Business.DoesNotExist:
            return JsonResponse({"msg": "You don't have business yet."}, status=404)

        try:
            queues = Queue.objects.filter(business=business)
        except Queue.DoesNotExist:
            return JsonResponse({"msg": "No queue found for this business."}, status=404)

        all_queue_entry = []
        for queue in queues:
            entry = Entry.objects.filter(queue=queue,
                                         status="completed",
                                         time_out__isnull=False)

            queue_entry = entry.annotate(
                waiting_time=ExpressionWrapper(
                    F('time_out') - F('time_in'),
                    output_field=DurationField()
                )
            ).aggregate(
                avg_waiting_time=Avg("waiting_time"),
                entry_count=Count("id")
            )

            waiting_time = 0
            if queue_entry["avg_waiting_time"]:
                waiting_time = queue_entry["avg_waiting_time"].total_seconds() / 60
            all_queue_entry.append({"queue": queue.name,
                                    "entry_count": queue_entry["entry_count"],
                                    "waiting_time": waiting_time})
        return all_queue_entry

    @http_get("/entry", auth=helpers.api_auth_user_required)
    def get_entry_number(self, request):
        """Return a list of the number of entries of this business."""
        entries = Entry.objects.filter(business__user=request.user)
        return {"total_entry": entries.count(),
                "waiting_entry": entries.filter(status="waiting").count(),
                "complete_entry": entries.filter(status="completed").count(),
                "cancel_entry": entries.filter(status="cancel").count()}

    @http_get("/summary", auth=helpers.api_auth_user_required)
    def get_summary_data(self, request):
        """Return summary data of this business."""
        queues = Queue.objects.filter(business__user=request.user)
        entries = Entry.objects.filter(business__user=request.user)
        waiting_time = entries.filter(time_out__isnull=False, status="completed")
        waiting_time = waiting_time.annotate(
            waiting_time=ExpressionWrapper(
                F('time_out') - F('time_in'),
                output_field=DurationField()
            )
        )
        waiting_time = waiting_time.aggregate(average_waiting_time=Avg('waiting_time'))
        waiting_time = waiting_time['average_waiting_time']
        avg_waiting_time = 0
        if waiting_time is not None:
            avg_waiting_time = math.ceil(waiting_time.total_seconds() / 60)
        return {"queue_count": queues.count(),
                "entry_count": entries.count(),
                "avg_waiting_time": avg_waiting_time}
