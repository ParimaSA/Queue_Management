"""Provide model using in business app."""
from django import forms
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Business(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class BusinessSignupForm(forms.ModelForm):
    name = forms.CharField(max_length=255)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            Business.objects.create(user=user, business_name=self.cleaned_data['business_name'])
        return user


class Queue(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    estimated_time = models.IntegerField(default=None)

    def __str__(self):
        return self.name


class Entry(models.Model):
    name = models.CharField(max_length=50)
    queue_name = models.ForeignKey(Queue, on_delete=models.CASCADE, null=True)
    tracking_code = models.CharField(max_length=50)
    time_in = models.DateTimeField(default=timezone.now)
    time_out = models.DateTimeField()
    status = models.CharField(max_length=20)

    def __str__(self):
        return self.name
