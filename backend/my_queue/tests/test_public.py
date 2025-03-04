import json
from .base import BaseTestCase

class PublicAPITestCase(BaseTestCase):
    """Test case for the public API endpoints."""

    def test_ping_endpoint(self):
        """Test that the ping endpoint returns a success response."""
        response = self.client.get("/public/ping", {"entry_id": 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Server is alive"})
