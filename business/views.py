"""Views for business app."""

from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.contrib import messages
from business.models import Business, Entry, Queue, QueueForm


def home(request):
    return render(request, "business/home.html")


def add_customer(request):
    return render(request, "business/add_customer.html")


def queue(request):
    return HttpResponse("Your Queue")


def signup(request):
    return HttpResponse("Signup")


def login(request):
    return HttpResponse("Login")


def show_entry(request, pk):
    """Display the entries for a specific business, filtered by today's date.

    Args:
        request: The HTTP request object.
        pk: The primary key of the business.

    Returns:
        Rendered template with queue and entry lists for the business.
    """
    today = timezone.now().date()
    business = Business.objects.get(pk=pk)
    queue_list = Queue.objects.filter(business=business)
    entry_list = Entry.objects.filter(
        business=business,
        time_in__date=today,
    ).order_by("time_in")
    return render(
        request,
        "business/show_entry.html",
        {"queue_list": queue_list, "entry_list": entry_list,
         "business": business},
    )


def add_queue(request, pk):
    """
    Add new queue to the specified business.

    Args:
        request: The HTTP request object.
        pk: The primary key of the business.

    Returns:
        Rendered template or redirect to the entry page with the updated queue.
    """
    business = get_object_or_404(Business, pk=pk)
    if request.method == "POST":
        form = QueueForm(request.POST)
        if form.is_valid():
            queue = form.save(commit=False)
            queue.business = business
            queue.save()
            messages.success(
                request,
                f"Successfully added the queue '{queue.name}' "
                f"with alphabet '{queue.alphabet}'.",
            )
            return redirect("business:businessEntry", pk=business.id)
    return render(request, "business/show_entry.html", {"business": business})


def edit_queue(request, pk):
    """
    Edit queue to the specified business.

    Args:
        request: The HTTP request object.
        pk: The primary key of the queue.

    Returns:
        Rendered template or redirect to the entry page with the updated queue.
    """
    queue = get_object_or_404(Queue, pk=pk)
    business = queue.business
    if request.method == "POST":
        form = QueueForm(request.POST, instance=queue)
        if form.is_valid():
            queue_form = form.save(commit=False)
            queue_form.business = business
            queue_form.save()
            messages.success(
                request,
                f"Successfully updated the queue '{queue.name}' "
                f"with the alphabet '{queue.alphabet}'.",
            )
            return redirect("business:businessEntry", pk=business.id)
    return render(request, "business/show_entry.html", {"business": business})


def run_queue(request, pk):
    """
    Mark a specific entry as completed.

    Args:
        request: The HTTP request object.
        pk: The primary key of the entry.

    Returns:
        Rendered template or redirect to the entry page with the updated queue.
    """
    entry = get_object_or_404(Entry, pk=pk)
    business = entry.business
    if request.method == "POST":
        entry.mark_as_completed()
        messages.success(request, f"{entry.name} marked as completed.")
        return redirect("business:businessEntry", pk=business.id)
    return render(request, "business/show_entry.html")
