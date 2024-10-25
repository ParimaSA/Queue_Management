from django.urls import path, include
from django.views.generic import RedirectView
from django.contrib.auth import views as auth_views
import customer.views as views

app_name = 'customer'
urlpatterns = [
    path('home/', views.HomeListView.as_view(), name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup, name='signup'),
    path('', RedirectView.as_view(url='home/', permanent=False)),
    path('<int:entry_id>/cancel_queue/', views.cancel_queue, name='cancel-queue')
]
