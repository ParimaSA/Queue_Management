"""Provide model using in customer app."""

from django import forms
from django.db import models
from django.contrib.auth.models import User
from business.models import Entry


class Customer(models.Model):
    """Represents a customer in the system.

    Customer has one-to-one relationship with the User model.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        """Return username of the customer."""
        return self.user.username


class CustomerSignupForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ["username", "password", "email"]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
            Customer.objects.create(user=user)  # Create a customer profile
        return user


class CustomerQueue(models.Model):
    """Represents a queue entry for a customer in a specific business."""

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE)

    def __str__(self):
        """Return a string representation of the CustomerQueue instance."""
        return f"{self.customer.user.username}, {self.entry.business},{self.entry.name}"
