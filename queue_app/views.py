"""Views for pages"""
from django.shortcuts import render, redirect
from django.views import generic
from .models import BusinessRegisterForm, Business
from django.contrib.auth.decorators import login_required
from django.contrib import messages


class IndexView(generic.ListView):
    """Generic index view for page home"""
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