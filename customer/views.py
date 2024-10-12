"""Views for customer app."""
from django.http import HttpResponse
from django.shortcuts import render


def home(request):
    return render(request, 'customer/home.html')


def profile(request):
    return HttpResponse("Profile")


def signup(request):
    return HttpResponse("Signup")


def login(request):
    return HttpResponse("Login")