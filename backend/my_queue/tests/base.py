import json
from django.test import TestCase
from ninja.testing import TestClient
from django.contrib.auth.models import User
from my_queue.models import Business, Queue
from mysite.api import api


class BaseTestCase(TestCase):
    client = TestClient(api)

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test1234')
        self.business = Business.objects.create(user=self.user, name='sushiro')
        self.queue = Queue.objects.create(name='Test Queue', business=self.business, prefix="A")

    def login(self, username, password):
        response_token = self.client.post(
            '/api/token/pair',
            data=json.dumps({
                'username': username,
                'password': password
            }),
            content_type='application/json'
        )
        token = response_token.json().get('access')
        return token
