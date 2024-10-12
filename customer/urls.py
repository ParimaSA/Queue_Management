from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'customer'
urlpatterns = [
    path('home/', views.home, name='home'),
    path('profile/', views.profile, name='profile'),
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('', RedirectView.as_view(url='home/', permanent=False)),
]
