from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'business'
urlpatterns = [
    path('home/', views.home, name='home'),
    path('add_customer/', views.add_customer, name='add_customer'),
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('', RedirectView.as_view(url='home/', permanent=False)),
    path('<int:pk>/businessEntry/', views.show_entry, name='businessEntry'),
    path('<int:pk>/addQueue/', views.add_queue, name='addQueue'),
    path('<int:pk>/runQueue/', views.run_queue, name='runQueue'),
]
