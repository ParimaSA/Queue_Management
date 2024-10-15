from django.urls import path, include
from django.views.generic import RedirectView
from . import views

app_name = 'customer'
urlpatterns = [
    path('home/', views.HomeListView.as_view(), name='home'),
    path('profile/', views.profile, name='profile'),
    # path('login/', views.login, name='login'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('signup/', views.signup, name='signup'),
    path('', RedirectView.as_view(url='home/', permanent=False)),
    path('<int:entry_id>/cancel_queue/', views.cancel_queue, name='cancel-queue')
]
