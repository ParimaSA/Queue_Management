"""
Views for the Queue Management application, handling queue reservations for businesses.
"""

from django.http import Http404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.views import View
from django.shortcuts import render, redirect
from .models import Business, Queue


@method_decorator(login_required, name='dispatch')
class ReserveQueueView(View):
    """
    Handles queue reservation for a business.
    """

    def get(self, request, business_id):
        """
        Displays the reservation options for the given business.
        """
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist as exc:
            raise Http404("Business does not exist.") from exc

        field_choices = business.field_choice.split(',')
        context = {
            'business': business,
            'field_choices': field_choices,
        }
        return render(request, 'queue_app/reserve_queue.html', context)

    def post(self, request, business_id):
        """
        Processes the queue reservation for the authenticated user.
        """
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist as exc:
            raise Http404("Business does not exist.") from exc

        field_choice = request.POST.get('field_choice')
        reserve_time = timezone.now()

        Queue.objects.create(
            user=request.user,
            business=business,
            field_choice=field_choice,
            reserve_time=reserve_time,
            status="Pending"
        )

        return redirect('queue_app:index')  # To be updated to another page like in_queue
