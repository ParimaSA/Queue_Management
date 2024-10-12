from django.urls import path
from . import views

app_name = 'queue_app'
urlpatterns = [
    path('', views.IndexView.as_view(), name='home'),
    path('bus_register/', views.business_register, name='bus_register'),
]
