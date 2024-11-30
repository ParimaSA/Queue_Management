import json
from datetime import datetime, timedelta

from django.contrib.auth.models import User
from django.utils.timezone import make_aware
from django.utils import timezone
from .base import BaseTestCase
from my_queue.models import Entry, Business, Queue


class Analytic(BaseTestCase):
    @classmethod
    def setUp(cls):
        """Create setup data for tests."""

        User.objects.create_user(username="owner1", password="123")
        
        business = Business.objects.create(
            user=User.objects.get(username="owner1"), name="Teenoi")

        # business_names = ["Teenoi", "Sushiro"]
        queue_types = ["Big", "Small"]

        base_time = make_aware(datetime(2024, 1, 1, 9, 0, 0))
        time_increment = timedelta(minutes=5)
        for queue_type in queue_types:
            # Set unique time for each queue by adding days

            # Create queue
            queue = Queue.objects.create(
                business=business, name=queue_type, prefix=queue_type[0]
            )

            if queue_type == "Big":
                entry_count = 5
            else:
                entry_count = 3
            # Adjust range for the desired number of entries
            for entry_counter in range(entry_count):
                entry_time = base_time + entry_counter * time_increment
                Entry.objects.create(
                    queue=queue,
                    business=business,
                    time_in=entry_time,
                    time_out=entry_time + timedelta(minutes=30),
                    status="completed",
                )

    def test_print(self):
        for e in Entry.objects.all():
            print(e.queue.name, e.time_in, e.time_out)
            print("-----")

    def no_business(self, response):
        """Test that an error message is shown if the user has no business."""
        self.assertEqual(response.json(), {
                         "msg": "You don't have business yet."})
        self.assertEqual(response.status_code, 404)

    def test_get_top_queue(self):
        """Test that the top queue is returned."""
        token = self.login(username="owner1", password="123")
        response = self.client.get(
            "/api/analytic/top-queue",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0], {'id': 1, 'name': 'Big', 'prefix': 'B'})
        self.assertEqual(response.json()[1], {'id': 2, 'name': 'Small', 'prefix': 'S'})
        
    def test_get_top_queue_no_business(self):
        """Test that an error message is shown if the user has no business."""
        User.objects.create_user(username="testuser", password="test1234")
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            "/api/analytic/top-queue",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.no_business(response)
    
    def test_analytic_in_time_slot(self):
        """Test that the number of entries in a time slot and waiting time is returned."""
        token = self.login(username="owner1", password="123")
        response = self.client.get(
            "/api/analytic/time-slot",
            headers={"Authorization": f"Bearer {token}"},
        )
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data[1]["start_time"], 8)
        
        avg_sec = sum([(e.time_out-e.time_in).total_seconds() for e in Entry.objects.all()]) / len(data)
        avg_waiting_mins = avg_sec / 60
        self.assertAlmostEqual(data[1]["estimate_waiting"], avg_waiting_mins, delta=5.0)
        self.assertEqual(data[1]["num_entry"], 8)
