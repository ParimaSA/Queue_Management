"""Views for customer app."""
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login
from .models import CustomerSignupForm, Customer, LoginForm


def home(request):
    return render(request, 'customer/home.html')


def profile(request):
    return HttpResponse("Profile")


def signup(request):
    if request.method =='POST':
        form = CustomerSignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('customer:home')
        else:
            messages.error(request, 'Form is invalid.')
            return redirect('customer:signup')
    else:
        form = CustomerSignupForm()
        return render(request, 'customer/signup.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                try:
                    Customer.objects.get(user=user)
                except Customer.DoesNotExist:
                    messages.error(request, 'Business account can not use with customer.')
                    return redirect('customer:login')
                login(request, user)
                return redirect('customer:home')
            else:
                messages.error(request, 'Invalid credentials')
        else:
            messages.error(request, 'Form is not valid')

    else:
        form = LoginForm()

    return render(request, 'customer/login.html', {'form': form})
