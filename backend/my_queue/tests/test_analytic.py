import json
from datetime import datetime, timedelta

from django.contrib.auth.models import User
from django.utils.timezone import make_aware
from .base import BaseTestCase
from my_queue.models import Entry, Business, Queue


class Analytic(BaseTestCase):

    def setUp(self):
        """Create setup data for tests."""

        User.objects.create_user(username="owner1", password="123")

        self.business = Business.objects.create(
            user=User.objects.get(username="owner1"), name="Teenoi")

        queue_types = ["Big", "Small"]

        base_time = make_aware(datetime(2024, 1, 1, 9, 0, 0))
        time_increment = timedelta(minutes=5)
        for queue_type in queue_types:
            # Set unique time for each queue by adding days

            # Create queue
            queue = Queue.objects.create(
                business=self.business, name=queue_type, prefix=queue_type[0]
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
                    business=self.business,
                    time_in=entry_time,
                    time_out=entry_time + timedelta(minutes=30),
                    status="completed",
                )

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
        self.assertEqual(response.json()[0], {
                         'id': 1, 'name': 'Big', 'prefix': 'B'})
        self.assertEqual(response.json()[1], {
                         'id': 2, 'name': 'Small', 'prefix': 'S'})

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
        my_entry = Entry.objects.filter(business__user__username="owner1", time_out__isnull=False, status="completed")
        avg_waiting_mins = self.calculate_average_waiting_time(my_entry)
        self.assertAlmostEqual(
            data[1]["estimate_waiting"], avg_waiting_mins, delta=5.0)
        self.assertEqual(data[1]["num_entry"], 8)

    def test_analytic_in_time_slot_no_business(self):
        """Test that an error message is shown if the user has no business."""
        User.objects.create_user(username="testuser", password="test1234")
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            "/api/analytic/time-slot",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.no_business(response)

    def test_get_entry_number(self):
        Entry.objects.create(
            queue=Queue.objects.get(name="Big"),
            business=self.business,
            time_in=make_aware(datetime(2024, 1, 1, 13, 0, 0)),
            status="cancel",
        )
        Entry.objects.create(
            queue=Queue.objects.get(name="Big"),
            business=self.business,
            time_in=make_aware(datetime(2024, 1, 1, 13, 5, 0)),
            status="waiting",
        )
        token = self.login(username="owner1", password="123")
        response = self.client.get(
            "/api/analytic/entry",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.json()["total_entry"], 10)
        self.assertEqual(response.json()["waiting_entry"], 1)
        self.assertEqual(response.json()["cancel_entry"], 1)
        self.assertEqual(response.json()["complete_entry"], 8)

    def test_get_summary_data(self):
        token = self.login(username="owner1", password="123")
        response = self.client.get(
            "/api/analytic/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        data = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["queue_count"], 2)
        self.assertEqual(data["entry_count"], 8)
        entries = Entry.objects.filter(
            business__user__username="owner1", time_out__isnull=False, status="completed")

        # Calculate total waiting time
        avg_waiting_mins = self.calculate_average_waiting_time(entries)
        self.assertAlmostEqual(
            data["avg_waiting_time"], avg_waiting_mins, delta=5.0)

    def calculate_average_waiting_time(self, entries):
        total_waiting_time = sum(
            [(e.time_out - e.time_in).total_seconds() for e in entries])

        avg_waiting_mins = total_waiting_time / \
            len(entries) / 60 if entries else 0

        return avg_waiting_mins

    def test_analytic_in_day(self):
        """Test that the number of entries in a day is returned."""
        Entry.objects.create(
            queue=Queue.objects.get(name="Small"),
            business=self.business,
            time_in=make_aware(datetime(2024, 1, 2, 14, 5, 0)),
            time_out=make_aware(datetime(2024, 1, 2, 15, 0, 0)),
            status="completed",
        )

        token = self.login(username="owner1", password="123")
        response = self.client.get(
            "/api/analytic/weekly",
            headers={"Authorization": f"Bearer {token}"},
        )
        my_entry = Entry.objects.filter(
            business__user__username="owner1", time_out__isnull=False, status="completed")
        data = response.json()
        entry_day_one = my_entry.filter(time_in__day=1)
        entry_day_two = my_entry.filter(time_in__day=2)
        avg_day_one = self.calculate_average_waiting_time(entry_day_one)
        avg_day_two = self.calculate_average_waiting_time(entry_day_two)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data[0]["day"], 2)
        self.assertEqual(data[1]["day"], 3)
        self.assertAlmostEqual(
            data[0]["waiting_time"], avg_day_one, delta=5.0)
        self.assertAlmostEqual(
            data[1]["waiting_time"], avg_day_two, delta=5.0)

    def test_analytic_in_day_no_business(self):
        """Test that an error message is shown if the user has no business."""
        User.objects.create_user(username="testuser", password="test1234")
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            "/api/analytic/weekly",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.no_business(response)

    def test_analytic_in_queue(self):
        """Test that the number of entries in a queue is returned."""
        Entry.objects.create(
            queue=Queue.objects.get(name="Small"),
            business=self.business,
            time_in=make_aware(datetime(2024, 1, 1, 13, 0, 0)),
            status="waiting",
        )
        token = self.login(username="owner1", password="123")
        response = self.client.get(
            "/api/analytic/queue",
            headers={"Authorization": f"Bearer {token}"},
        )
        
        data = response.json()
        my_entry = Entry.objects.filter(
            business__user__username="owner1", time_out__isnull=False, status="completed")
        big_entry = my_entry.filter(queue__name="Big")
        small_entry = my_entry.filter(queue__name="Small")
        avg_small = self.calculate_average_waiting_time(big_entry)
        avg_big = self.calculate_average_waiting_time(small_entry)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data[0]["queue"], "Big")
        self.assertEqual(data[1]["queue"], "Small")
        self.assertEqual(data[0]["entry_count"], 5)
        # does not count the one that is waiting
        self.assertEqual(data[1]["entry_count"], 3) 
        
        self.assertAlmostEqual(data[0]["waiting_time"], avg_big, delta=5.0)
        self.assertAlmostEqual(data[1]["waiting_time"], avg_small, delta=5.0)

    def test_analytic_in_queue_no_business(self):
        """Test that an error message is shown if the user has no business."""
        User.objects.create_user(username="testuser", password="test1234")
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            "/api/analytic/queue",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.no_business(response)