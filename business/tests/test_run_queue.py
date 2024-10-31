import datetime
from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from django.contrib import messages
from business.models import User, Business, Queue, Entry


def create_entry(queue, business, hours):
    """Create an entry instance."""
    time = timezone.now() + datetime.timedelta(hours=hours)
    return Entry.objects.create(queue=queue, business=business, time_in=time)


class RunQueueTest(TestCase):
    """Test case for running a queue in the business application."""

    def setUp(self):
        """Set up a user, a business and a queue instance for the tests."""
        self.user = User.objects.create_user(username="testuser", password="test1234")
        self.business = Business.objects.create(user=self.user, name="test business")
        self.queue = Queue.objects.create(
            business=self.business, name="Dining", alphabet="A", estimated_time=None
        )
        self.client.login(username="testuser", password="test1234")

    def test_show_only_entry_with_waiting_status(self):
        """Test that only entries with a 'waiting' status are shown."""
        waiting_entry = create_entry(self.queue, self.business, -4)
        waiting_entry.status = "waiting"
        waiting_entry.save()

        completed_entry = create_entry(self.queue, self.business, -2)
        completed_entry.status = "completed"
        completed_entry.save()

        self.assertEqual(Entry.objects.count(), 2)
        response = self.client.get(
            reverse("business:home")
        )
        self.assertContains(response, waiting_entry.name)
        self.assertContains(response, waiting_entry.status)

        self.assertNotContains(response, completed_entry.name)
        self.assertNotContains(response, completed_entry.status)

    def test_show_only_entry_in_this_day(self):
        """Test that only entries from the current day are displayed."""
        today_entry = create_entry(self.queue, self.business, 0)
        today_entry.status = "waiting"
        today_entry.save()

        yesterday_entry = create_entry(self.queue, self.business, -24)
        yesterday_entry.status = "waiting"
        yesterday_entry.save()

        self.assertEqual(Entry.objects.count(), 2)
        response = self.client.get(
            reverse("business:home")
        )
        self.assertEqual(response.context["entry_list"].count(), 1)

    def test_run_queue_function(self):
        """Test the functionality of running the queue."""
        entry = create_entry(self.queue, self.business, -2)
        self.assertEqual(Entry.objects.count(), 1)
        response = self.client.post(reverse("business:run_queue", args=[entry.pk]))
        self.assertEqual(response.status_code, 302)
        entry.refresh_from_db()
        self.assertEqual(entry.status, "completed")
        expected_time_out = timezone.now()
        self.assertTrue(
            expected_time_out - datetime.timedelta(seconds=1)
            <= entry.time_out
            <= expected_time_out + datetime.timedelta(seconds=1)
        )

    def test_run_queue_render_on_get_request(self):
        """Test that if the request method is GET, it renders the show_entry page."""
        entry = create_entry(self.queue, self.business, -2)
        url = reverse("business:run_queue", args=[entry.pk])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)

        self.assertTemplateUsed(response, "business/show_entry.html")

    def test_run_queue_render_on_other_request_methods(self):
        """Test that if the request method is not POST, it renders the show_entry page."""
        entry = create_entry(self.queue, self.business, -2)
        url = reverse("business:run_queue", args=[entry.pk])
        response = self.client.put(url)

        self.assertEqual(response.status_code, 200)

        self.assertTemplateUsed(response, "business/show_entry.html")

    def test_run_queue_not_found(self):
        """Test that if the entry does not exist, an error message is shown and redirects to home."""
        non_existing_pk = 9999

        response = self.client.post(reverse("business:run_queue", args=[non_existing_pk]))

        self.assertRedirects(response, reverse("business:home"))

        messages_list = list(response.wsgi_request._messages)
        self.assertEqual(len(messages_list), 1)
        self.assertEqual(messages_list[0].message, "Cannot run this entry.")
        self.assertEqual(messages_list[0].level, messages.ERROR)

