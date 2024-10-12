"""Provide test for authentication."""

import django.test
from django.urls import reverse
from django.contrib.auth.models import User
from mysite import settings


class UserAuthTest(django.test.TestCase):
    """Test authentication system."""

    def setUp(self):
        """Superclass setUp creates a Client object and initializes test database."""
        super().setUp()
        self.email = "test@gmail.com"
        self.username = "test"
        self.password = "1234"
        self.user1 = User.objects.create_user(
            email=self.email,
            username=self.username,
            password=self.password,
        )
        self.user1.save()

    def test_logout(self):
        """A user can log out using the logout url.

        As an authenticated user, when user visit /accounts/logout/
        then user will be logged out and then redirected to the login page.
        """
        logout_url = reverse("logout")
        # Client.login returns true on success
        self.assertTrue(
            self.client.login(username=self.username, password=self.password)
        )
        # visit the logout page
        form_data = {}
        response = self.client.post(logout_url, form_data)
        self.assertEqual(302, response.status_code)

        # should redirect us to where? Polls index? Login?
        self.assertRedirects(response, reverse("queue_app:home"))

    def test_login_view(self):
        """A user can log in using the login view."""
        login_url = reverse("login")
        # Can get the login page
        response = self.client.get(login_url)
        self.assertEqual(200, response.status_code)
        # Can login using a POST request
        # usage: client.post(url, {'key1":"value", "key2":"value"})
        form_data = {"email": "test@gmail.com", "username": "test", "password": "1234"}
        response = self.client.post(login_url, form_data)
        # after successful login, should redirect browser somewhere
        self.assertEqual(302, response.status_code)
        # should redirect us to the polls index page ("polls:index")
        self.assertRedirects(response, reverse(settings.LOGIN_REDIRECT_URL))
