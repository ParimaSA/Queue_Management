from django.urls import path
from django.views.generic import RedirectView
from django.contrib.auth import views as auth_views
from . import views

app_name = 'business'
urlpatterns = [
    path('home/', views.home, name='home'),
    path('add_customer/', views.add_customer, name='add_customer'),
    path('login/', views.login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='business:home'), name='logout'),
    path('signup/', views.signup, name='signup'),
    path('', RedirectView.as_view(url='home/', permanent=False)),
]