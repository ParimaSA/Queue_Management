from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from my_queue.models import Business, Queue, Entry
from django.contrib.auth.models import User


class EntryModelTests(TestCase):
    """Test for the Entry model."""

    @classmethod
    def setUpTestData(cls):
        """Set up sample users, businesses, and queues for testing."""
        cls.user1 = User.objects.create_user(username='user1', password='password1')
        cls.user2 = User.objects.create_user(username='user2', password='password2')

        cls.business1 = Business.objects.create(user=cls.user1, name="Business A")
        cls.business2 = Business.objects.create(user=cls.user2, name="Business B")
        cls.queue1 = Queue.objects.create(business=cls.business1, name="Small", prefix="A")
        cls.queue2 = Queue.objects.create(business=cls.business2, name="Big", prefix="B")

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

    def test_name_generation(self):
        """Test name generation for entries"""
        Entry.objects.create(name="", queue=self.queue1, business=self.business1)
        Entry.objects.create(name="", queue=self.queue1, business=self.business1)
        first_entry = Entry.objects.filter(queue=self.queue1).first()
        self.assertEqual(first_entry.name, "A1")
        queue_count = Entry.objects.filter(queue=self.queue1).count()
        self.assertEqual(queue_count, 2)

        Entry.objects.create(name="", queue=self.queue2, business=self.business1)
        first_entry_queue2 = Entry.objects.filter(queue=self.queue2).first()
        self.assertEqual(first_entry_queue2.name, "B1")

    def test_get_queue_before(self):
        """Check if the queue is retrieved correctly under specified conditions."""

        today = timezone.now()
        plus_time = timedelta(minutes=5)
        entry1 = Entry.objects.create(name='Test Entry', queue=self.queue1, business=self.business1, time_in=today)
        entry2 = Entry.objects.create(name='Test Entry2', queue=self.queue1, business=self.business1, time_in=today+plus_time)

        entry3 = Entry.objects.create(name='Test Entry3', queue=self.queue1, business=self.business1,
                                      time_in=today + plus_time*2)

        self.assertEqual(entry3.get_queue_position(), 2)
        self.assertEqual(entry1.get_queue_position(), 0)

        entry1.status = "completed"
        entry1.save()
        self.assertEqual(entry3.get_queue_position(), 1)

        entry3.status = "cancel"
        entry3.save()
        self.assertEqual(entry3.get_queue_position(), 0)