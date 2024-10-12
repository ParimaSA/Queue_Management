from django.urls import path
from . import views

app_name = 'queue_app'
urlpatterns = [
    path('', views.IndexView.as_view(), name='home'),
]
