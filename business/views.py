"""Views for business app."""
from django.http import HttpResponse
from django.shortcuts import render


def home(request):
    return render(request, 'business/home.html')


def add_customer(request):
    return render(request, 'business/add_customer.html')


def queue(request):
    return HttpResponse("Your Queue")


def signup(request):
    return HttpResponse("Signup")


def login(request):
    return HttpResponse("Login")


