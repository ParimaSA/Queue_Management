import json
from django.contrib.auth.models import User
from django.utils import timezone
from .base import BaseTestCase
from my_queue.models import Entry, Business, Queue


class EditQueueTest(BaseTestCase):
    """Test case for editing a queue in the business application."""

    def test_edit_queue_function(self):
        """Test that a valid queue is updated successfully."""
        token = self.login(username="testuser", password="test1234")
        edit_attrs = {"name": "Take Away", "prefix": "B"}

        response = self.client.put(
            f"/api/queue/{self.queue.id}",
            data=json.dumps(edit_attrs),
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.queue.refresh_from_db()
        self.assertEqual(self.queue.name, "Take Away")
        self.assertEqual(self.queue.prefix, "B")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "msg": f"Successfully updated the queue '{edit_attrs['name']}' "
                f"with the prefix '{edit_attrs['prefix']}'."
            },
        )

    def test_invalid_edit_form_not_save(self):
        """Test that an invalid form does not update a queue."""
        token = self.login(username="testuser", password="test1234")
        edit_attrs = {"name": "", "alphabet": "B"}
        response = self.client.put(
            f"/api/queue/{self.queue.id}",
            data=json.dumps(edit_attrs),
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.queue.refresh_from_db()
        self.assertEqual(self.queue.name, "Test Queue")
        self.assertEqual(self.queue.prefix, "A")

    def test_edit_queue_not_found(self):
        """Test that if the queue does not exist, an error message is shown and redirects to home."""
        edit_attrs = {"name": "Ok", "prefix": "B"}
        token = self.login(username="testuser", password="test1234")
        response = self.client.put(
            f"/api/queue/9999",
            data=json.dumps(edit_attrs),
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "Cannot edit this queue."})


class AddCustomerTestCase(BaseTestCase):
    """Tests for add_entry_to_queue."""

    def test_post_request_adds_customer(self):
        """Test adding a customer with POST request."""
        token = self.login(username="testuser", password="test1234")
        response = self.client.post(
            f"/api/queue/new-entry/{self.queue.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(Entry.objects.count(), 1)
        entry = Entry.objects.first()
        self.assertEqual(entry.queue, self.queue)
        self.assertEqual(entry.business, self.business)
        self.assertIsNotNone(entry.tracking_code)
        self.assertEqual(entry.status, "waiting")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "msg": f"New entry successfully added to queue {self.queue.name}.",
                "tracking_code": entry.tracking_code,
            },
        )

    def test_post_request_with_non_existent_queue(self):
        """Test handling of POST request with a non-existent queue."""
        token = self.login(username="testuser", password="test1234")
        # Attempt to add a customer with a queue ID that does not exist
        response = self.client.post(
            f"/api/queue/new-entry/9999", headers={"Authorization": f"Bearer {token}"}
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "This queue does not exist"})


class DeleteQueueTestCase(BaseTestCase):
    """Test case for delete_queue"""

    def test_delete_queue_success(self):
        """Test that a business can delete their queue."""
        token = self.login(username="testuser", password="test1234")
        response = self.client.delete(
            f"/api/queue/{self.queue.id}", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), None)  # Response should be empty
        self.assertFalse(Queue.objects.filter(id=self.queue.id).exists())

    def test_delete_queue_not_found(self):
        """Test that a business cannot delete another business's queue."""
        token = self.login(username="testuser", password="test1234")
        another_business = Business.objects.create(
            user=User.objects.create_user(username="otheruser", password="password")
        )
        another_queue = Queue.objects.create(
            name="Another Queue", business=another_business
        )

        response = self.client.delete(
            f"/api/queue/{another_queue.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.json(), {"msg": "Can't delete another business's queue"}
        )


class GetWaitingEntriesTestCase(BaseTestCase):
    """Tests for get_waiting_entry_in_queue."""

    def setUp(self):
        """Set up a business, queue, and entries for testing."""
        super().setUp()
        self.today = timezone.localdate()

        self.entry1 = Entry.objects.create(
            queue=self.queue,
            business=self.business,
            status="waiting",
            time_in=timezone.now(),
        )
        self.entry2 = Entry.objects.create(
            queue=self.queue,
            business=self.business,
            status="waiting",
            time_in=timezone.now(),
        )

        # Create a non-waiting entry
        self.entry3 = Entry.objects.create(
            queue=self.queue,
            business=self.business,
            status="completed",
            time_in=timezone.now(),
        )

    def test_get_waiting_entries(self):
        """Test retrieving waiting entries for a specific queue."""
        token = self.login(
            username="testuser", password="test1234"
        )  # Adjust to your actual login method
        response = self.client.get(
            f"/api/queue/{self.queue.id}/entries",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200)  # Check for a successful response
        # Should contain only the waiting entries
        self.assertEqual(len(response.json()), 2)  # Should return two entries
        self.assertIn("tracking_code", response.json()[0])
        self.assertIn("tracking_code", response.json()[1])

    def test_get_waiting_entries_no_waiting_entries(self):
        """Test retrieving waiting entries when none exist."""
        # Create a queue without waiting entries
        another_queue = Queue.objects.create(
            name="Another Test Queue", business=self.business
        )

        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            f"/api/queue/{another_queue.id}/entries",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)  # Should return no entries
