from django.urls import path
from . import views

app_name = 'queue_app'
urlpatterns = [
    path('bus_register/', views.business_register, name='bus_register'),
]
