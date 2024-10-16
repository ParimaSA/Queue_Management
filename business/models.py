"""Provide model using in business app."""
from django import forms
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from nanoid import generate


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
    alphabet = models.CharField(max_length=1, default='A')
    estimated_time = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


class Entry(models.Model):
    name = models.CharField(max_length=50)
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE, null=True)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, null=True)
    tracking_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    time_in = models.DateTimeField(default=timezone.now)
    time_out = models.DateTimeField(null=True)
    status = models.CharField(max_length=20, default='waiting')

    def save(self, *args, **kwargs):
        if not self.tracking_code and self.status != 'completed':
            while True:
                new_tracking_code = generate('1234567890abcdefghijklmnopqrstuvwxyz', size=10)
                if not Entry.objects.filter(tracking_code=new_tracking_code, time_out__isnull=True).exists():
                    self.tracking_code = new_tracking_code
                    break

        if not self.name:
            today = timezone.now().date()
            queue_entries_today = Entry.objects.filter(queue=self.queue, time_in__date=today).count() + 1
            self.name = f"{self.queue.alphabet}{queue_entries_today}"

        super().save(*args, **kwargs)

    def mark_as_completed(self):
        self.status = 'completed'
        self.time_out = timezone.now()
        self.tracking_code = None
        self.save()

    def __str__(self):
        return self.name
