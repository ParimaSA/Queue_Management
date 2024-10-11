"""Views for pages"""
from django.views import generic
from .models import Business


class IndexView(generic.ListView):
    """Generic index view for page home"""
    template_name = "queue_app/index.html"
    context_object_name = "business_list"

    def get_queryset(self):
        """Return business by their alphabet."""
        return Business.objects.order_by("name")
