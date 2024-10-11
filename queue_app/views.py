"""Views for pages"""
from django.views import generic
from .models import Business


class IndexView(generic.ListView):
    """generic index view for page home"""
    template_name = "queue_app/index.html"
    context_object_name = "business_list"

    def get_queryset(self):
        """Return the last five published questions."""
        return Business.objects.order_by("name")
