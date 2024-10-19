"""Views for business app."""
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse
from .models import Business, Queue, Entry
from django.utils import timezone


def home(request, business_id):
    business = get_object_or_404(Business, id=business_id)
    context = {'business': business}
    return render(request, 'business/home.html', context)


def add_customer(request, business_id):
    business = get_object_or_404(Business, id=business_id)
    queues = Queue.objects.filter(business=business)

    tracking_code = None

    if request.method == 'POST':
        queue_id = request.POST.get('queue')
        selected_queue = get_object_or_404(Queue, id=queue_id)

        entry = Entry(
            queue=selected_queue,
            business=business,
            time_in=timezone.now()
        )
        entry.save()

        tracking_code = entry.tracking_code

    return render(request, 'business/add_customer.html', {
        'business': business,
        'queues': queues,
        'tracking_code': tracking_code
    })


def queue(request):
    return HttpResponse("Your Queue")


def signup(request):
    return HttpResponse("Signup")


def login(request):
    return HttpResponse("Login")


