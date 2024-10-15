"""Views for customer app."""
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.generic.list import ListView
from .models import CustomerQueue,Customer, Entry
from django.contrib import messages
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def cancel_queue(request, entry_id):
    Entry.objects.get(id=entry_id).delete()
    return redirect('customer:home')

class HomeListView(ListView):
    template_name = 'customer/home.html'
    context_object_name = 'customer_queue_list'

    def get_queryset(self):
        return CustomerQueue.objects.filter(customer__user__username=self.request.user)


    def post(self, request, *args, **kwargs):
        track_code = request.POST['track-code']
        try:
            my_entry = Entry.objects.get(tracking_code=str(track_code))
        except (Entry.DoesNotExist, KeyError):
            logger.error(f'trackcode {track_code} does not exist in entry')
            return redirect('customer:home')

        logger.info(f'trackcode {track_code} existed in entry.')
        try:
            entry_count = CustomerQueue.objects.filter(customer__user=self.request.user, entry=my_entry).count()
            my_customer = Customer.objects.get(user=self.request.user)
        except (Customer.DoesNotExist):
            logger.error(f'{self.request.user.username} is not customer')
            return redirect('customer:home')
        if not entry_count:
            CustomerQueue.objects.create(customer=my_customer, entry=my_entry)
            logger.info(f'create customer_queue for {self.request.user}')

        return redirect('customer:home')


def profile(request):
    return HttpResponse("Profile")


def signup(request):
    return HttpResponse("Signup")


def login(request):
    return HttpResponse("Login")