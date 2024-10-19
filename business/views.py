"""Views for business app."""
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render, redirect
from .models import SignUpForm, LoginForm, Business


def home(request):
    return render(request, 'business/home.html')


def add_customer(request):
    return render(request, 'business/add_customer.html')


def queue(request):
    return HttpResponse("Your Queue")


def signup(request):
    if request.method =='POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('business:home')
        else:
            messages.error(request, 'Form is invalid.')
            return redirect('business:signup')
    else:
        form = SignUpForm()
        return render(request, 'business/signup.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                try:
                    Business.objects.get(user=user)
                except Business.DoesNotExist:
                    messages.error(request, 'Customer account can not use with business.')
                    return redirect('business:login')
                login(request, user)
                return redirect('business:home')
            else:
                messages.error(request, 'Invalid credentials')
        else:
            messages.error(request, 'Form is not valid')

    else:
        form = LoginForm()

    return render(request, 'business/login.html', {'form': form})
