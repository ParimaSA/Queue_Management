from django.urls import path
from . import views

app_name = 'queue_app'
urlpatterns = [
    path('reserve/<int:business_id>/', views.ReserveQueueView.as_view(), name='reserve_queue'),
]
