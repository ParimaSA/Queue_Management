import json
from datetime import time
import unittest
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import MagicMock, patch
from django.contrib.auth.models import User
from my_queue.models import Business, Queue, get_default_profile_image
from my_queue.schemas import BusinessRegisterSchema, BusinessUpdatedSchema
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
        self.assertEqual(response.json()[0]["id"], self.business.id)
        self.assertEqual(response.json()[0]["name"], self.business.name)

        response = self.client.get("/api/business")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Unauthorized")

    def test_no_business(self):
        """Test to retrieve non-existent business of authenticated user."""
        user = User.objects.create_user(
            username="testuser2", password="test1234")
        token = self.login(username="testuser2", password="test1234")
        response = self.client.get(
            "/api/business", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.json(), [])


class BusinessQueueTestCase(BaseTestCase):
    """Test case for queue related api routes."""

    def test_get_business_queues(self):
        """Test to retrieve queue lists for business."""
        token = self.login(username="testuser", password="test1234")
        response = self.client.get(
            "/api/business/queues", headers={"Authorization": f"Bearer {token}"}
        )
        # another business owner
        new_user = User.objects.create_user(
            username="testuser2", password="test1234")
        new_business = Business.objects.create(
            user=new_user, name="Dj-khaled food")
        Queue.objects.create(name="New Queue", business=new_business)
        Queue.objects.create(name="New Queue2", business=new_business)

        self.assertEqual(response.json(), [
                         {"id": 1, "name": "Test Queue", "prefix": "A"}])

        token = self.login(username="testuser2", password="test1234")
        response = self.client.get(
            "/api/business/queues", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(
            response.json(),
            [{"id": 2, "name": "New Queue", "prefix": "A"}, {
                "id": 3, "name": "New Queue2", "prefix": "A"}],
        )

    def test_get_no_business(self):
        """Test to see non existent business info of authenticated user."""
        new_user = User.objects.create_user(
            username="testuser2", password="test1234")

        token = self.login(username="testuser2", password="test1234")
        response = self.client.get(
            "/api/business/queues", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(response.json(), {
                         "msg": "You don't have business yet."})
        self.assertEqual(response.status_code, 404)

    def test_get_business_queues_unauthenticated(self):
        """Test to retrieve queue lists for unauthenticated users."""
        response = self.client.get("/api/business/queues")
        self.assertEqual(response.status_code, 401)

    def test_create_business_queue(self):
        """Test to create new queue for business."""
        token = self.login(username="testuser", password="test1234")
        queue_data = {"name": "New Queue", "prefix": "N"}
        response = self.client.post(
            "/api/business/queues",
            # Convert the dictionary to a JSON string
            data=json.dumps(queue_data),
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(
            response.json(),
            {"msg": f'Queue {queue_data["name"]} is successfully created.'},
        )
        self.assertEqual(Queue.objects.count(), 2)
        self.assertTrue(Queue.objects.filter(
            name="New Queue", prefix="N").exists())

        queue = Queue.objects.last()
        self.assertEqual(queue.name, "New Queue")
        self.assertEqual(queue.prefix, "N")
        self.assertEqual(queue.business, self.business)
        self.assertEqual(queue.estimated_time, None)

        # Same prefix
        response = self.client.post(
            "/api/business/queues",
            # Convert the dictionary to a JSON string
            data=json.dumps(queue_data),
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.json(), {
                         "error": 'Queue with name New Queue already exist.'})

    def create_business_queue_exceed_limit(self):
        """Test to create new queue for business."""
        # Fail
        token = self.login(username="testuser", password="test1234")
        queue_names = [
            "ThunderStorm88",
            "Windbreaker202",
            "ElectricPower9",
            "FireDragon2024",
            "BlueSkyClouds1",
            "MountainPeak56",
            "SolarEclipseX9",
            "LightningBolt2",
            "FrostbiteZero9",
            "GalaxyRangers2",
            "OceanWaves360X",
            "StarryNight99X",
            "DesertVoyager3",
            "MoonlightDance",
            "FrozenTundra1X",
            "CrystalRiver77",
            "SeventhHeavenX",
        ]

        queue_prefix = [
            "T",  # 0
            "W",
            "E",
            "F",
            "B",
            "M",
            "S",
            "L",
            "F",
            "G",
            "O",
            "S",
            "D",
            "M",
            "F",
            "C",
            "R",  # 16
        ]
        for i in range(len(queue_names)):
            queue_data = {"name": queue_names[i], "prefix": queue_prefix[i]}
            response = self.client.post(
                "/api/business/queues",
                # Convert the dictionary to a JSON string
                data=json.dumps(queue_data),
                content_type="application/json",
                headers={"Authorization": f"Bearer {token}"})
            if i < 14:
                self.assertEqual(response.json(),
                                 {"msg": f"Queue {queue_names[i]} is successfully created."})
            else:  # exceed limit
                self.assertEqual(response.json(), {
                    "error": f"The maximum number of queue you can create is 16."})


class BusinessRegister(BaseTestCase):
    def test_business_register(self):
        """Test the business registration endpoint."""
        data_dict = BusinessRegisterSchema(username="new_user", password1="hackme11",
                                           password2="hackme11", business_name="New Business").dict()
        # success
        response = self.client.post(
            "/api/business/register",
            # Convert the dictionary to a JSON string
            data=json.dumps(data_dict),
            content_type="application/json",
        )

        self.assertEqual(response.json(), {
                         'msg': 'Business account is successfully created.'})

    def test_business_register_fail(self):
        """Test the business registration endpoint."""
        # unmatching password
        data_dict = BusinessRegisterSchema(username="new_user", password1="hackme11",
                                           password2="hackme113", business_name="New Business").dict()
        # fail
        response = self.client.post(
            "/api/business/register",
            # Convert the dictionary to a JSON string
            data=json.dumps(data_dict),
            content_type="application/json",
        )
        self.assertEqual(response.json(),
                         {'msg': 'Can not create this account', 'error': '{"password2": [{"message": "The two password fields didn\\u2019t match.", "code": "password_mismatch"}]}'})

        # existing username
        data_dict = BusinessRegisterSchema(username="testuser", password1="hackme11",
                                           password2="hackme11", business_name="New Business").dict()
        # fail
        response = self.client.post(
            "/api/business/register",
            # Convert the dictionary to a JSON string
            data=json.dumps(data_dict),
            content_type="application/json",
        )
        self.assertEqual(response.json(), {'msg': 'Can not create this account',
                         'error': '{"username": [{"message": "A user with that username already exists.", "code": "unique"}]}'})

    # TODO
    # def test_email_register(self):
    #     """Test the email registration endpoint."""
    #     # data_dict = BusinessRegisterSchema(username="new_user", password1="hackme11",
    #     #                                    password2="hackme11", business_name="New Business").dict()

    #     data_dict = {"email": "abc@gmail.com"}
    #     # success
    #     response = self.client.post(
    #         "/api/business/email-register",
    #         # Convert the dictionary to a JSON string
    #         data=json.dumps(data_dict),
    #         content_type="application/json",
    #     )

    #     self.assertEqual(response.json(), {
    #                      'msg': 'Business account is successfully created.'})


class BusinessProfile(BaseTestCase):

    DEFAULT_PROFILE = get_default_profile_image()

    def send_request_business_updated(self, edit_attrs, token):
        response = self.client.put(
            "/api/business/business_updated",
            data=json.dumps(edit_attrs),
            content_type="application/json",
            headers={"Authorization": f"Bearer {token}"},
        )
        return response

    def test_edit_business_profile(self):
        """Test the business edit profile update endpoint with multiple formats"""
        test_cases = [
            {
                "name": "New Business Name",
                # time converted to string
                "open_time": time(9, 0).strftime("%H:%M:%S"),
                "close_time": time(17, 0).strftime("%H:%M:%S"),
            },
            {
                "name": "New Business Name",
                "open_time": "09:00:00",  # raw string
                "close_time": "17:00:00",
            },
        ]
        for edit_attrs in test_cases:
            with self.subTest(edit_attrs=edit_attrs):
                token = self.login(username="testuser", password="test1234")
                response = self.send_request_business_updated(
                    edit_attrs, token)
                self.assertEqual(
                    response.json(),
                    {"msg": f"Successfully updated the details of 'New Business Name'."},
                )
                self.business.refresh_from_db()
                self.assertEqual(self.business.name, "New Business Name")
                self.assertEqual(self.business.open_time.strftime(
                    "%H:%M:%S"), "09:00:00")
                self.assertEqual(self.business.close_time.strftime(
                    "%H:%M:%S"), "17:00:00")
                self.assertEqual(response.status_code, 200)

    def test_edit_business_profile_fail(self):
        """Test the business edit profile update endpoint with invalid data"""

        # invalid time format
        edit_attrs = {
            "name": "New Business Name",
            "open_time": "09:00:0F",  # invalid time format
            "close_time": "17:00",
        }
        token = self.login(username="testuser", password="test1234")
        response = self.send_request_business_updated(edit_attrs, token)
        self.business.refresh_from_db()
        self.assertEqual(response.json(), {
            "detail": [
                {
                    "type": "time_parsing",
                    "loc": ["body", "edit_attrs", "open_time"],
                    "msg": "Input should be in a valid time format, invalid character in second",
                    "ctx": {"error": "invalid character in second"},
                }
            ]
        },
        )
        self.assertEqual(response.status_code, 422)

    def test_edit_business_profile_unauthenticated(self):
        """Test the business edit profile update endpoint for users with no business"""
        User.objects.create_user(username="testuser2", password="test1234")
        token = self.login(username="testuser2", password="test1234")
        edit_attrs = {
            "name": "New Business Name",
            "open_time": time(9, 0).strftime("%H:%M:%S"),
            "close_time": time(17, 0).strftime("%H:%M:%S"),
        }
        response = self.send_request_business_updated(edit_attrs, token)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {
                         "msg": "Cannot edit this business."})

    def get_profile_image(self, token):
        response = self.client.get(
            "/api/business/profile", headers={"Authorization": f"Bearer {token}"}
        )
        return response

    def test_business_profile(self):
        """Test get the business profile for business no profile."""
        token = self.login(username="testuser", password="test1234")
        response = self.get_profile_image(token)
        # default profile image
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"image": self.DEFAULT_PROFILE})

    def test_no_business(self):
        """Test get the business profile for no business."""
        User.objects.create_user(
            username="testuser2", password="test1234")
        token = self.login(username="testuser2", password="test1234")
        response = self.get_profile_image(token)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "You don't have business yet."})
        
    def test_upload_profile_image_no_business(self):
        """Test to upload profile image for no business."""
        User.objects.create_user(
            username="testuser2", password="test1234")
        token = self.login(username="testuser2", password="test1234")
        test_image = SimpleUploadedFile(
            name="test_image.jpg",
            content=b"file_content_here",  
            content_type="image/jpeg"
        )
        response = self.client.post(
            "/api/business/profile", 
            {"file": test_image},
            format="multipart",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"msg": "You don't have business yet."})
        
    @patch('my_queue.models.Business.objects.get')
    @patch('my_queue.models.Business.image', new_callable=MagicMock)
    def test_upload_profile_image_success(self, mock_image, mock_get):
        # Simulate an uploaded file
        test_image = SimpleUploadedFile(
            name="test_image.jpg",
            content=b"file_content_here",  # Replace with valid binary content of an image
            content_type="image/jpeg"
        )

        # Create a mock business object
        mock_business = MagicMock(spec=Business)
        mock_business.image = MagicMock()
        mock_business.image.name = 'mocked_image.jpg'
        mock_business.image.url = '/media/mocked_image.jpg'
        mock_business.image.save = MagicMock()
        mock_business.image.delete = MagicMock()

        # Mock the return of the Business object
        mock_get.return_value = mock_business

        # Simulate login and get the token
        token = self.login(username="testuser", password="test1234")

        # Perform the POST request to upload the image
        response = self.client.post(
            "/api/business/profile",  
            {"file": test_image},
            format="multipart",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        # Check the response
        self.assertEqual(response.status_code, 200)
        self.assertIn("mocked_image.jpg", response.json().get("business", ""))
        self.assertIn("uploaded", response.json().get("msg", ""))

        # Check that the save method was called
        mock_business.image.save.assert_called_with(
            test_image.name, unittest.mock.ANY, save=True
        )
        mock_business.image.delete.assert_called_once()
