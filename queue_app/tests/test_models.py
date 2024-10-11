"""Tests for models"""
from unittest.mock import patch
from django.test import TestCase
from queue_app.models import Business, Category
from datetime import datetime
from django.contrib.auth.models import User
from django.utils import timezone


def convert_to_time(time_str):
    return datetime.strptime(time_str, '%H:%M:%S').time()


class TestBusiness(TestCase):
    def setUp(self):
        """
        Set up a mock Business object for testing.
        """
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.category = Category.objects.create(name="Restaurant")
        self.business = Business.objects.create(user=self.user, name="test", category=self.category,
                                                approve_status="Approved", open_day="Monday, Tuesday, Wednesday,"
                                                " Thursday, Friday, Saturday, Sunday",
                                                open_time=convert_to_time('06:00:14'),
                                                close_time=convert_to_time('18:00:00'),
                                                open_status="Open", field_name="Table size",
                                                field_choice="Big, Medium, Small")

    @patch('django.utils.timezone.now')
    def test_business_open(self, mock_now: patch):
        """Test if is_opened() works correctly with same day and different day of open_time and close_time"""
        # mock time now to be 8.00 am
        mock_now.return_value = timezone.make_aware(timezone.datetime(2024, 10, 10, 8, 0, 0))
        self.assertTrue(self.business.is_opened())

        self.business.open_time = convert_to_time('22:30:14')
        # mock time now to be 0.00 am
        mock_now.return_value = timezone.make_aware(timezone.datetime(2024, 10, 10, 0, 0, 0))
        self.business.close_time = convert_to_time('5:55:55')  # 5 am
        self.assertTrue(self.business.is_opened())

    @patch('django.utils.timezone.now')
    def test_business_days(self, mock_now: patch):
        """Test that the is_opened() correctly returns False if today is not an open day."""
        self.business.open_day = "Monday, Tuesday, Wednesday, Friday, Saturday, Sunday"
        # rn it's thursday
        mock_now.return_value = timezone.make_aware(timezone.datetime(2024, 10, 10, 8, 0, 0))
        self.assertFalse(self.business.is_opened())
