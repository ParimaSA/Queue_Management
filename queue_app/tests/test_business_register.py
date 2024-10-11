from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from queue_app.models import Category, Business


class BusinessRegisterTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test1234')

    def test_only_authenticated_user_can_register(self):
        """
        Test that the view renders the form only for authenticated users.
        """
        self.client.login(username='testuser', password='test1234')
        response = self.client.get(reverse('queue_app:bus_register'))
        self.assertEqual(response.status_code, 200)

    def test_business_register_create_business_for_valid_post(self):
        """
        Test that a valid POST request create a business and redirect.
        """
        self.client.login(username='testuser', password='test1234')
        category = Category.objects.create(name='Restaurant')
        form = {
            'name': 'demobusiness',
            'category': category.id,
            'open_day': ['monday', 'friday'],
            'open_time': '10:00:00',
            'close_time': '20:00:00',
            'open_status': 'Open',
            'field_name': 'Table size',
            'field_choice': 'medium'
        }
        response = self.client.post(reverse('queue_app:bus_register'), form)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('queue_app:home'))

        business = Business.objects.get(name='demobusiness')
        self.assertEqual(business.user, self.user)
        self.assertEqual(business.approve_status, 'Pending')

    def test_business_register_create_business_for_invalid_post(self):
        self.client.login(username='testuser', password='test1234')
        category = Category.objects.create(name='Restaurant')
        form = {
            'name': '',
            'category': category.id,
            'open_day': ['monday', 'friday'],
            'open_time': '10:00:00',
            'close_time': '20:00:00',
            'open_status': 'Open',
            'field_name': 'Table size',
            'field_choice': 'medium'
        }
        response = self.client.post(reverse('queue_app:bus_register'), form)
        self.assertFalse(response.context['form'].is_valid())
