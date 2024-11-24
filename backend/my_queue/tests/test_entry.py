from datetime import timedelta
from django.utils import timezone
from django.test import TestCase
from django.contrib.auth.models import User
from my_queue.models import Entry, Business, Queue
from .base import BaseTestCase


class ShowEntryTestCase(BaseTestCase):
    """Test for showing business owner's entries."""

    def test_show_entry_authenticated_with_business(self):
        """Test that if the user is authenticated and has a business, the entries are displayed."""
        token = self.login(username="testuser", password="test1234")
        today = timezone.now()
        entry = Entry.objects.create(
            name="Test Entry", queue=self.queue, business=self.business, time_in=today
        )

        response = self.client.get(
            f"/api/entry/9999", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "This entry does not exist."})

        iso_format = entry.time_in.isoformat(timespec="milliseconds").replace(
            "+00:00", "Z"
        )

        data_json = {
            "id": entry.id,
            "name": "Test Entry",
            "queue": {
                "id": self.queue.id,
                "name": "Test Queue",
                "estimated_time": None,
            },
            "business": {"user": 1, "name": "sushiro"},
            "tracking_code": entry.tracking_code,
            "time_in": iso_format,
            "time_out": None,
            "status": "waiting",
        }

        response = self.client.get(
            f"/api/entry/{entry.id}", headers={"Authorization": f"Bearer {token}"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), data_json)

    def test_show_entry_authenticated_with_no_business(self):
        """Test that if the user is authenticated but has no business, it redirects to login."""
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            f"/api/entry/{1}", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "This entry does not exist."})


class CustomerTestCase(TestCase):
    """Test api route related to customer."""

    @classmethod
    def setUpTestData(cls):
        """Create setup data for tests."""

        User.objects.create_user(username="owner1", password="123")
        User.objects.create_user(username="owner2", password="123")

        owners = User.objects.filter(username__startswith="owner")
        business_names = ["Teenoi", "Sushiro"]
        queue_types = ["Big", "Small"]

        for i, business_name in enumerate(business_names):
            Business.objects.create(user=owners[i], name=business_name)

        base_time = timezone.now()
        time_increment = timedelta(minutes=5)
        for business in Business.objects.all():
            for queue_type in queue_types:
                # Set unique time for each queue by adding days
                queue_base_time = base_time + timedelta(days=business.pk - 2)

                # Create queue
                queue = Queue.objects.create(
                    business=business, name=queue_type, prefix=queue_type[0]
                )

                for entry_counter in range(
                    3
                ):  # Adjust range for the desired number of entries
                    entry_time = queue_base_time + entry_counter * time_increment
                    Entry.objects.create(
                        queue=queue,
                        business=business,
                        time_in=entry_time,
                    )

    def setUp(self):
        """Log in a test user before each test.

        This method is called before each test, ensuring that the user is authenticated.
        """
        super().setUp()

        # today
        self.big_entry_sushiro = Entry.objects.filter(
            business__name="Sushiro", queue__name="Big"
        ).first()

        # yesterday
        self.big_entry_teenoi = Entry.objects.filter(
            business__name="Teenoi", queue__name="Big"
        ).first()

    def test_enter_tracking_code(self):
        """Test that visitor can see queue based on tracking code."""

        # today queue
        tracking_code = self.big_entry_sushiro.tracking_code
        response = self.client.get(f"/api/entry/tracking-code/{tracking_code}")
        self.assertEqual(response.status_code, 200)
        iso_format = self.big_entry_sushiro.time_in.isoformat(
            timespec="milliseconds"
        ).replace("+00:00", "Z")
        response_data = [
            {
                "id": self.big_entry_sushiro.id,
                "name": self.big_entry_sushiro.name,
                "queue": {
                    "id": self.big_entry_sushiro.queue.id,
                    "name": self.big_entry_sushiro.queue.name,
                    "estimated_time": None,
                },
                "business": self.big_entry_sushiro.business.name,
                "tracking_code": tracking_code,
                "time_in": iso_format,
                "time_out": None,
                "status": "waiting",
                "queue_ahead": 0,
                "estimate_waiting_time": -1,
            }
        ]
        self.assertEqual(response.json(), response_data)

    def test_access_wrong_tracking_code(self):
        """Test that users receive error messages when entered invalid tracking code."""
        response = self.client.get(f"/api/entry/tracking-code/wrong-code")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "Invalid tracking code"})

        # existed but not today entry (yesterday entry)
        response = self.client.get(
            f"/api/entry/tracking-code/{self.big_entry_teenoi.tracking_code}"
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "Invalid tracking code"})

    def test_cancel(self):
        """Test that user can cancel entry."""
        entry_id = self.big_entry_teenoi.id
        tracking_code = self.big_entry_teenoi.tracking_code
        response = self.client.post(
            f"/api/entry/tracking-code/{tracking_code}/cancel",
        )
        self.assertEqual(response.status_code, 200)
        self.big_entry_teenoi.refresh_from_db()
        self.assertEqual(self.big_entry_teenoi.status, "cancel")

    def test_cancel_wrong_tracking_code(self):
        """User cannot cancel wrong tracking code"""
        tracking_code = "abc"
        response = self.client.post(
            f"/api/entry/tracking-code/{tracking_code}/cancel",
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "Invalid tracking code."})

    def test_cancel_other_status(self):
        """Test that user cannot cancel other status (not waiting)."""
        # last queue
        small_queue_sushiro = Entry.objects.filter(
            business__name="Sushiro", queue__name="Small"
        ).last()

        tracking_code = small_queue_sushiro.tracking_code
        small_queue_sushiro.status = "checked in"
        small_queue_sushiro.save()
        small_queue_sushiro.refresh_from_db()

        response = self.client.post(
            f"/api/entry/tracking-code/{tracking_code}/cancel",
        )
        self.assertEqual(Entry.objects.filter(id=small_queue_sushiro.id).count(), 1)

        self.assertEqual(response.json(), {"msg": "You cannot cancel this entry."})
        self.assertEqual(response.status_code, 400)


def create_entry(queue, business, hours):
    """Create an entry instance."""
    time = timezone.now() + timedelta(hours=hours)
    return Entry.objects.create(queue=queue, business=business, time_in=time)


class RunQueueTest(BaseTestCase):
    """Test case for running a queue in the business application."""

    def test_run_queue_function(self):
        """Test the functionality of running the queue."""
        token = self.login(username="testuser", password="test1234")
        entry = create_entry(self.queue, self.business, -2)
        self.assertEqual(Entry.objects.count(), 1)

        response = self.client.post(
            f"/api/entry/{entry.id}/status/complete",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertTrue(response.status_code, 200)

        entry.refresh_from_db()
        self.assertEqual(entry.status, "completed")
        expected_time_out = timezone.now()
        self.assertTrue(
            expected_time_out - timedelta(seconds=1)
            <= entry.time_out
            <= expected_time_out + timedelta(seconds=1)
        )
        self.assertEqual(response.json(), {"msg": f"{entry.name} marked as completed."})

    def test_run_queue_not_found(self):
        """Test that if the entry does not exist, an error message is shown and redirects to home."""
        non_existing_pk = 9999
        token = self.login(username="testuser", password="test1234")
        response = self.client.post(
            f"/api/entry/{non_existing_pk}/status/complete",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "Deletion failed."})


class CancelEntryTestCase(BaseTestCase):
    """Test case for cancel entries for business."""

    def setUp(self):
        """Set up test data."""
        # Create two users and businesses
        super().setUp()

        self.user2 = User.objects.create_user(username="testuser2", password="test1234")
        self.business2 = Business.objects.create(user=self.user2, name="Business Two")

        # Create an entry for business1
        self.entry1 = Entry.objects.create(business=self.business, name="Test Entry 1")

    def test_successful_cancel_entry(self):
        """Test that a business owner can successfully cancel an entry."""
        token = self.login(username="testuser", password="test1234")
        entry_id = self.entry1.id
        response = self.client.post(
            f"/api/entry/{entry_id}/status/cancel",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(), {"msg": f"{self.entry1.name} marked as cancel."}
        )

        # Refresh the entry from the database and check the status
        self.entry1.refresh_from_db()
        self.assertEqual(self.entry1.status, "cancel")

    def test_cancel_non_existent_entry(self):
        """Test that attempting to cancel a non-existent entry returns a 404."""
        token = self.login(username="testuser2", password="test1234")
        response = self.client.post(
            f"/api/entry/999/status/cancel",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "This entry does not exist."})

    def test_cancel_entry_of_another_business(self):
        """Test that a business owner cannot cancel an entry belonging to another business."""
        token = self.login(
            username="testuser2", password="test1234"
        )  # Authenticate as user2
        entry_id = self.entry1.id

        # Entry belongs to business1
        response = self.client.post(
            f"/api/entry/{entry_id}/status/cancel",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "This entry does not exist."})

        # Ensure that the entry status is still "waiting"
        self.entry1.refresh_from_db()
        self.assertEqual(self.entry1.status, "waiting")
