"""Views for pages."""

from django.shortcuts import render, redirect
from django.views import generic, View
from .models import BusinessRegisterForm, Business, Queue, RegisterForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.http import Http404
from django.utils import timezone
from django.utils.decorators import method_decorator


def signup(request):
    """Register a new user."""
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get("username")
            raw_passwd = form.cleaned_data.get("password1")

            # Authenticate using username and password
            user = authenticate(username=username, password=raw_passwd)

            if user is not None:
                login(request, user)
                messages.success(request, "Registration successful.")
                return redirect("queue_app:home")
            else:
                messages.error(request, "Authentication failed. Please try again.")
                return redirect("queue_app:signup")
        else:
            messages.error(
                request, "Invalid form submission. Please correct the errors."
            )
            return render(request, "registration/signup.html", {"form": form})
    else:
        form = RegisterForm()
        return render(request, "registration/signup.html", {"form": form})


class IndexView(generic.ListView):
    """Generic index view for page home."""

    template_name = "queue_app/index.html"
    context_object_name = "business_list"

    def get_queryset(self):
        """Return business by their alphabet."""
        return Business.objects.order_by("name")


@login_required
def business_register(request):
    """
    Handle business registration process.

    On POST, validate and save the form for the logged-in user, then redirect
    to the home page with a success message.
    """
    if request.method == "POST":
        form = BusinessRegisterForm(request.POST)
        if form.is_valid():
            business = form.save(commit=False)
            business.user = request.user
            business.save()
            messages.success(
                request,
                f"{request.user.username}, "
                f"your request for {business.name} "
                f"has been successfully submitted!",
            )
            return redirect("queue_app:home")
    else:
        form = BusinessRegisterForm()
    return render(request, "queue_app/business_register.html", {"form": form})

  
@method_decorator(login_required, name="dispatch")
class ReserveQueueView(View):
    """Handle queue reservation for a business."""

    def get(self, request, business_id):
        """Display the reservation options for the given business."""
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist as exc:
            raise Http404("Business does not exist.") from exc

        field_choices = business.field_choice.split(",")
        context = {
            "business": business,
            "field_choices": field_choices,
        }
        return render(request, "queue_app/reserve_queue.html", context)

    def post(self, request, business_id):
        """Process the queue reservation for the authenticated user."""
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist as exc:
            raise Http404("Business does not exist.") from exc

        field_choice = request.POST.get("field_choice")
        reserve_time = timezone.now()

        Queue.objects.create(
            user=request.user,
            business=business,
            field_choice=field_choice,
            reserve_time=reserve_time,
            status="Pending",
        )

        return redirect("queue_app:home")
