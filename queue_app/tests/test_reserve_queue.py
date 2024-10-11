from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from ..models import Business, Queue, Category
from django.utils import timezone

User = get_user_model()


class ReserveQueueViewTests(TestCase):
    def setUp(self):
        """
        Create a test user, category, and business. Log in the user.
        """
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.category = Category.objects.create(name='Test Category')
        self.business = Business.objects.create(
            user=self.user,
            name='Test Business',
            category=self.category,
            open_day='Monday',
            open_time='09:00:00',
            close_time='17:00:00',
            open_status='Open',
            field_name='Field Name',
            field_choice='Field 1,Field 2,Field 3'
        )
        self.client.login(username='testuser', password='testpass')

    def test_get_reserve_queue_view_authenticated(self):
        """
        Test access for authenticated users to reserve queue view.
        """
        response = self.client.get(reverse('queue_app:reserve_queue', args=[self.business.id]))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'queue_app/reserve_queue.html')
        self.assertContains(response, 'Reserve Queue at Test Business')

    def test_get_reserve_queue_view_unauthenticated(self):
        """
        Test that unauthenticated users are redirected to login.
        """
        self.client.logout()
        response = self.client.get(reverse('queue_app:reserve_queue', args=[self.business.id]))
        self.assertRedirects(response, '/accounts/login/?next=' + reverse('queue_app:reserve_queue', args=[self.business.id]))

    def test_post_reserve_queue_view(self):
        """
        Test that authenticated users can create a queue reservation.
        """
        response = self.client.post(reverse('queue_app:reserve_queue', args=[self.business.id]), {
            'field_choice': 'Field 1'
        })

        self.assertEqual(Queue.objects.count(), 1)
        queue = Queue.objects.first()
        self.assertEqual(queue.user, self.user)
        self.assertEqual(queue.business, self.business)
        self.assertEqual(queue.field_choice, 'Field 1')
        self.assertEqual(queue.status, 'Pending')
        self.assertTrue(queue.reserve_time <= timezone.now())

        self.assertRedirects(response, reverse('queue_app:index'))
