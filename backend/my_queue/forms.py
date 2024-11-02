"""Provide forms using in app."""

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Business


class SignUpForm(UserCreationForm):
    """A form for user signup, capturing username, password, and business name."""

    class Meta:
        model = User
        fields = ("username", "password1", "password2")

    def save(self, commit=True):
        """Create a new Business object for this user."""
        user = super().save(commit=False)
        if commit:
            user.save()
            business_name = self.cleaned_data.get("business_name")
            Business.objects.create(user=user, name=business_name)
        return user
