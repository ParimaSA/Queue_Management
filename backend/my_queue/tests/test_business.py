import json
from django.contrib.auth.models import User
from my_queue.models import Business, Queue
from .base import BaseTestCase


class ShowBusinessTestCase(BaseTestCase):
    """Test for showing business detail of a business owner."""

    def test_my_business(self):
        """Test retrieving the authenticated user's business."""
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            "/api/business", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 200)

        # Check if the returned business ID matches
        self.assertEqual(response.json()["user"], self.business.user.id)
        self.assertEqual(response.json()["name"], self.business.name)

        response = self.client.get("/api/business")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Unauthorized")

    def test_no_business(self):
        """Test to retrieve non-existent business of authenticated user."""
        user = User.objects.create_user(username="testuser2", password="test1234")
        token = self.login(username="testuser2", password="test1234")
        response = self.client.get(
            "/api/business", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "You don't have business yet."})


class BusinessQueueTestCase(BaseTestCase):
    """Test case for queue related api routes."""

    def test_get_business_queues(self):
        """Test to retrieve queue lists for business."""
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            "/api/business/queues", headers={"Authorization": f"Bearer {token}"}
        )

        # another business owner
        new_user = User.objects.create_user(username="testuser2", password="test1234")
        new_business = Business.objects.create(user=new_user, name="Dj-khaled food")
        Queue.objects.create(name="New Queue", business=new_business)
        Queue.objects.create(name="New Queue2", business=new_business)

        self.assertEqual(response.json(), [{"id": 1, "name": "Test Queue"}])

        token = self.login(username="testuser2", password="test1234")
        response = self.client.get(
            "/api/business/queues", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(
            response.json(),
            [{"id": 2, "name": "New Queue"}, {"id": 3, "name": "New Queue2"}],
        )

    def test_get_no_business(self):
        """Test to see non existent business info of authenticated user."""
        new_user = User.objects.create_user(username="testuser2", password="test1234")

        token = self.login(username="testuser2", password="test1234")
        response = self.client.get(
            "/api/business/queues", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.json(), {"msg": "You don't have business yet."})
        self.assertEqual(response.status_code, 404)

    def test_get_business_queues_unauthenticated(self):
        """Test to retrieve queue lists for unauthenticated users."""
        response = self.client.get("/api/business/queues")
        self.assertEqual(response.status_code, 401)

    def test_create_business_queue(self):
        """Test to create new queue for business."""
        token = self.login(username="testuser", password="test1234")
        queue_data = {"name": "New Queue", "prefix": "NQ"}
        response = self.client.post(
            "/api/business/queues",
            data=json.dumps(queue_data),  # Convert the dictionary to a JSON string
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(
            response.json(),
            {"msg": f'Queue {queue_data["name"]} is successfully created.'},
        )
        self.assertEqual(Queue.objects.count(), 2)
        self.assertTrue(Queue.objects.filter(name="New Queue", prefix="NQ").exists())

        queue = Queue.objects.last()
        self.assertEqual(queue.name, "New Queue")
        self.assertEqual(queue.prefix, "NQ")
        self.assertEqual(queue.business, self.business)
        self.assertEqual(queue.estimated_time, None)

        # Same prefix
        response = self.client.post(
            "/api/business/queues",
            data=json.dumps(queue_data),  # Convert the dictionary to a JSON string
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.json(), {"msg": "This prefix has been used."})
