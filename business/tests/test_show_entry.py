from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User
from business.models import Business, Queue, Entry


class ShowEntryTestCase(TestCase):
    """Test case for show entry of a queue in the business application."""
    def setUp(self):
        """Set up a user instance for the tests."""
        self.user = User.objects.create_user(username='testuser', password='test1234')

    def test_show_entry_authenticated_with_business(self):
        """Test that if the user is authenticated and has a business, the entries are displayed."""
        self.business = Business.objects.create(user=self.user)

        queue = Queue.objects.create(name='Test Queue', business=self.business)
        today = timezone.now().date()
        Entry.objects.create(name='Test Entry', business=self.business, time_in=today)

        self.client.login(username='testuser', password='test1234')

        response = self.client.get(reverse('business:home'))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'business/show_entry.html')

        self.assertIn('business', response.context)
        self.assertIn('queue_list', response.context)
        self.assertIn('entry_list', response.context)

        self.assertEqual(len(response.context['entry_list']), 1)
        self.assertEqual(response.context['entry_list'][0].name, 'Test Entry')

    def test_show_entry_authenticated_without_business(self):
        """Test that if the user is authenticated but has no business, it redirects to login."""
        self.client.login(username='testuser', password='test1234')

        response = self.client.get(reverse('business:home'))
        self.assertRedirects(response, reverse('business:login'))

    def test_show_entry_not_authenticated(self):
        """Test that if the user is not authenticated, it redirects to login."""
        response = self.client.get(reverse('business:home'))
        self.assertRedirects(response, reverse('business:login'))
