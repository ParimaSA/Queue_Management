from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from business.models import Business, Queue


class AddQueueTest(TestCase):
    """Test case for adding a queue in the business application."""

    def setUp(self):
        """Set up a user and a business instance for the tests."""
        self.user = User.objects.create_user(username="testuser", password="test1234")
        self.business = Business.objects.create(user=self.user, name="test business")
        self.client.login(username="testuser", password="test1234")

    def test_add_queue_function(self):
        """Test that a valid queue is added successfully."""
        url = reverse("business:add_queue")
        form = {"name": "Dining", "alphabet": "A"}
        response = self.client.post(url, form)
        self.assertEqual(Queue.objects.count(), 1)

        queue = Queue.objects.first()
        self.assertEqual(queue.name, "Dining")
        self.assertEqual(queue.alphabet, "A")
        self.assertEqual(queue.business, self.business)
        self.assertEqual(queue.estimated_time, None)

        self.assertRedirects(
            response, reverse("business:home")
        )

    def test_invalid_form_not_save(self):
        """Test that an invalid form does not create a queue."""
        url = reverse("business:add_queue")
        form = {"name": "", "alphabet": "A"}

        response = self.client.post(url, form)
        self.assertEqual(Queue.objects.count(), 0)
        self.assertTemplateUsed(response, "business/show_entry.html")

    def test_add_queue_render_on_get_request(self):
        """Test that if the request method is GET, it renders the show_entry page."""
        url = reverse("business:add_queue")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

        self.assertTemplateUsed(response, "business/show_entry.html")

        self.assertIn("business", response.context)
        self.assertEqual(response.context["business"], self.business)

    def test_add_queue_render_on_other_request_methods(self):
        """Test that if the request method is not POST, it renders the show_entry page."""
        url = reverse("business:add_queue")
        response = self.client.put(url)

        self.assertEqual(response.status_code, 200)

        self.assertTemplateUsed(response, "business/show_entry.html")

        self.assertIn("business", response.context)
        self.assertEqual(response.context["business"], self.business)
