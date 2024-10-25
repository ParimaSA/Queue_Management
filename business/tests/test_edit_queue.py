from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from django.contrib import messages
from business.models import Business, Queue


class EditQueueTest(TestCase):
    """Test case for editing a queue in the business application."""

    def setUp(self):
        """Set up a user, a business and a queue instance for the tests."""
        self.user = User.objects.create_user(username="testuser", password="test1234")
        self.client.login(username="testuser", password="test1234")
        self.business = Business.objects.create(user=self.user, name="test business")
        self.queue = Queue.objects.create(
            business=self.business, name="Dining", alphabet="A", estimated_time=None
        )

    def test_edit_queue_function(self):
        """Test that a valid queue is updated successfully."""
        url = reverse("business:edit_queue", args=[self.queue.pk])
        form = {"name": "Take Away", "alphabet": "B"}

        response = self.client.post(url, form)
        self.queue.refresh_from_db()
        self.assertEqual(self.queue.name, "Take Away")
        self.assertEqual(self.queue.alphabet, "B")
        self.assertRedirects(
            response, reverse("business:home")
        )

    def test_invalid_edit_form_not_save(self):
        """Test that an invalid form does not update a queue."""
        url = reverse("business:edit_queue", args=[self.queue.pk])
        form = {"name": "", "alphabet": "B"}

        response = self.client.post(url, form)
        self.queue.refresh_from_db()
        self.assertEqual(self.queue.name, "Dining")
        self.assertEqual(self.queue.alphabet, "A")
        self.assertTemplateUsed(response, "business/show_entry.html")

    def test_edit_queue_render_on_get_request(self):
        """Test that if the request method is GET, it renders the show_entry page."""
        url = reverse("business:edit_queue", args=[self.queue.pk])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

        self.assertTemplateUsed(response, "business/show_entry.html")

        self.assertIn("business", response.context)
        self.assertEqual(response.context["business"], self.business)

    def test_edit_queue_render_on_other_request_methods(self):
        """Test that if the request method is not POST, it renders the show_entry page."""
        url = reverse("business:edit_queue", args=[self.queue.pk])
        response = self.client.put(url)

        self.assertEqual(response.status_code, 200)

        self.assertTemplateUsed(response, "business/show_entry.html")

        self.assertIn("business", response.context)
        self.assertEqual(response.context["business"], self.business)

    def test_edit_queue_not_found(self):
        """Test that if the queue does not exist, an error message is shown and redirects to home."""
        non_existing_pk = 9999

        response = self.client.post(reverse("business:edit_queue", args=[non_existing_pk]))

        self.assertRedirects(response, reverse("business:home"))

        messages_list = list(response.wsgi_request._messages)
        self.assertEqual(len(messages_list), 1)
        self.assertEqual(messages_list[0].message, "Cannot edit this queue.")
        self.assertEqual(messages_list[0].level, messages.ERROR)

