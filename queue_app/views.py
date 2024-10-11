from django.shortcuts import render
from django.views import generic
from .models import Business
# Create your views here.


class IndexView(generic.ListView):
    template_name = "queue_app/index.html"
    context_object_name = "business_list"

    def get_queryset(self):
        """Return the last five published questions."""
        return Business.objects.order_by('name')

# def home(request):
#     context = {'business_list' : Business.objects.all()}
#     return render(request, 'index.html', context)