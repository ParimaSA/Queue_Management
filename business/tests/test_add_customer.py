from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from business.models import Business, Queue, Entry


class AddCustomerViewTest(TestCase):
    """Tests for the Add Customer view in the business app."""

    def setUp(self):
        """Set up test data: user, business, and queue."""
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.business = Business.objects.create(user=self.user, name="Test Business")
        self.queue = Queue.objects.create(name="Test Queue", business=self.business)
        self.add_customer_url = reverse('business:add_customer', args=[self.business.id])

    def test_add_customer_get(self):
        """Test successful GET request to add_customer."""
        response = self.client.get(self.add_customer_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'business/add_customer.html')
        self.assertContains(response, self.business.name)
        self.assertContains(response, self.queue.name)

    def test_add_customer_post_success(self):
        """Test successful POST request to add_customer."""
        response = self.client.post(self.add_customer_url, {
            'queue': self.queue.id
        })
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'business/add_customer.html')

        entry = Entry.objects.filter(queue=self.queue, business=self.business).first()
        self.assertIsNotNone(entry)
        self.assertIsNotNone(entry.tracking_code)
        self.assertContains(response, entry.tracking_code)

    def test_add_customer_post_invalid_queue(self):
        """Test POST request with invalid queue ID returns 404."""
        invalid_queue_id = 9999
        response = self.client.post(self.add_customer_url, {
            'queue': invalid_queue_id
        })
        self.assertEqual(response.status_code, 404)

    def test_add_customer_invalid_business(self):
        """Test GET request with invalid business ID returns 404."""
        invalid_business_url = reverse('business:add_customer', args=[9999])
        response = self.client.get(invalid_business_url)
        self.assertEqual(response.status_code, 404)
