"""Provide forms using in app."""

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignUpForm(UserCreationForm):
    """A form for user signup, capturing username, password, and business name."""

    class Meta:
        model = User
        fields = ("username", "password1", "password2")
