from django.test import TestCase
from business.models import Business, Queue, Entry
from django.contrib.auth.models import User
from django.utils import timezone
from unittest.mock import patch


class EntryModelTests(TestCase):
    """Test for the Entry model."""

    @classmethod
    def setUpTestData(cls):
        """Set up sample users, businesses, and queues for testing."""
        cls.user1 = User.objects.create_user(username='user1', password='password1')
        cls.user2 = User.objects.create_user(username='user2', password='password2')

        cls.business1 = Business.objects.create(user=cls.user1, name="Business A")
        cls.business2 = Business.objects.create(user=cls.user2, name="Business B")
        cls.queue1 = Queue.objects.create(business=cls.business1, name="Small", alphabet="A")
        cls.queue2 = Queue.objects.create(business=cls.business2, name="Big", alphabet="B")

    def test_tracking_code_uniqueness_across_queues(self):
        """Test that tracking codes are unique across different queues."""
        entry1 = Entry.objects.create(name="Customer 1", queue=self.queue1, business=self.business1, time_out=None)
        entry2 = Entry.objects.create(name="Customer 2", queue=self.queue2, business=self.business2, time_out=None)
        self.assertNotEqual(entry1.tracking_code, entry2.tracking_code)

    def test_tracking_code_reset_after_time_out(self):
        """Test that the tracking code is reset to None after marking an entry as completed."""
        entry = Entry.objects.create(name="Customer 3", queue=self.queue1, business=self.business1, time_out=None)
        entry.mark_as_completed()
        self.assertIsNone(entry.tracking_code)

    def test_name_generation_with_reset(self):
        """Test name generation for entries, ensuring it resets correctly."""
        Entry.objects.create(name="", queue=self.queue1, business=self.business1)
        Entry.objects.create(name="", queue=self.queue1, business=self.business1)
        last_entry = Entry.objects.last()
        self.assertEqual(last_entry.name, "A2")

        tomorrow = timezone.now() + timezone.timedelta(days=1)
        with patch('django.utils.timezone.now', return_value=tomorrow):
            new_entry = Entry.objects.create(name="", queue=self.queue1, business=self.business1)
            self.assertEqual(new_entry.name, "A1")
