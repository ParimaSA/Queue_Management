"""Views for business app."""
from django.http import HttpResponse
from django.shortcuts import render, redirect
from .models import Business, Entry, Queue
from django.utils import timezone


def home(request):
    return render(request, 'business/home.html')


def add_customer(request):
    """Add a customer to a specific business and queue."""
    this_user = request.user

    try:
        business = Business.objects.get(user=this_user)
    except Business.DoesNotExist:
        return redirect('business:login')

    queues = Queue.objects.filter(business=business)
    if not queues.exists():
        return redirect('business:home')

    tracking_code = None

    if request.method == 'POST':
        queue_id = request.POST.get('queue')

        try:
            selected_queue = Queue.objects.get(id=queue_id, business=business)
        except Queue.DoesNotExist:
            return redirect('business:home')

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
