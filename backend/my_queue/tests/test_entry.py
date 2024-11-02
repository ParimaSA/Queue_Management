from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from my_queue.models import Entry, Business, Queue
from .base import BaseTestCase

class ShowEntryTestCase(BaseTestCase):
    """Test for showing business owner's entries."""
    def test_show_entry_authenticated_with_business(self):
        """Test that if the user is authenticated and has a business, the entries are displayed."""
        token = self.login(username='testuser', password='test1234')
        today = timezone.now()
        entry = Entry.objects.create(name='Test Entry', queue=self.queue, business=self.business, time_in=today)

        response = self.client.get(f"/api/entry/9999", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "This entry does not exist."})

        iso_format = entry.time_in.isoformat(timespec='milliseconds').replace('+00:00', 'Z')

        data_json = {
            "id": entry.id,
            "name": "Test Entry",
            "queue": {
                "id": self.queue.id,
                "name": 'Test Queue',
                "estimated_time": None
            },
            "business": {
                "user": 1,
                "name": "sushiro"
            },
            "tracking_code": entry.tracking_code,
            "time_in": iso_format,
            "time_out": None,
            "status": "waiting"
        }

        response = self.client.get(f"/api/entry/{entry.id}", headers={"Authorization": f"Bearer {token}"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), data_json)


    def test_show_entry_authenticated_with_no_business(self):
        """Test that if the user is authenticated but has no business, it redirects to login."""
        token = self.login(username='testuser', password='test1234')
        response = self.client.get(f"/api/entry/{1}", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "This entry does not exist."})



class HomeViewTests(BaseTestCase):
    """Test HomeView."""

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
                queue_base_time = base_time + timedelta(days=business.pk-2)

                # Create queue
                queue = Queue.objects.create(
                    business=business, name=queue_type, prefix=queue_type[0]
                )

                for entry_counter in range(3):  # Adjust range for the desired number of entries
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



    def test_enter_tracking_code(self): #TODO
        """Test that visitor can see queue based on tracking code.
        """

        # today queue
        tracking_code = self.big_entry_sushiro.tracking_code
        response = self.client.get(
            f'/api/entry/tracking-code/{tracking_code}'
        )
        self.assertEqual(response.status_code, 200)
        iso_format = self.big_entry_sushiro.time_in.isoformat(timespec='milliseconds').replace('+00:00', 'Z')
        response_data = [
            {
                "id": self.big_entry_sushiro.id,
                "name":  self.big_entry_sushiro.name,
                "queue": {
                    "id":  self.big_entry_sushiro.queue.id,
                    "name":  self.big_entry_sushiro.queue.name,
                    "estimated_time": None
                },
                "business":  self.big_entry_sushiro.business.name,
                "tracking_code": tracking_code,
                "time_in": iso_format,
                "time_out": None,
                "status": "waiting",
                "queue_ahead": 0
            }
        ]
        self.assertEqual(response.json(), response_data)

    def test_access_wrong_tracking_code(self):
        """Test that users receive error messages when entered invalid tracking code."""
        response = self.client.get(
            f'/api/entry/tracking-code/wrong-code'
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "Invalid tracking code"})

        # existed but not today entry (yesterday entry)
        response = self.client.get(
            f'/api/entry/tracking-code/{self.big_entry_teenoi.tracking_code}'
        )
        self.assertEqual(response.status_code, 404) # TODO
        self.assertEqual(response.json(), {"msg": "Invalid tracking code"})


    def test_cancel(self):
        """Test that user can cancel entry.
        """
        entry_id = self.big_entry_teenoi.id
        tracking_code = self.big_entry_teenoi.tracking_code
        response = self.client.post(
                f"/api/entry/tracking-code/{tracking_code}/cancel",
        )
        self.assertEqual(response.status_code, 200)
        self.big_entry_teenoi.refresh_from_db()
        self.assertEqual(self.big_entry_teenoi.status, 'cancel')


    def test_cancel_wrong_tracking_code(self):
        """User cannot cancel wrong tracking code"""
        tracking_code = 'abc'
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
        self.assertEqual(
            Entry.objects.filter(id=small_queue_sushiro.id).count(), 1
        )

        self.assertEqual(response.json(), {"msg": "You cannot cancel this entry."})
        self.assertEqual(response.status_code,  400)

