from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Business(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    approve_status = models.CharField(max_length=50, default="Pending")
    open_day = models.CharField(max_length=300)
    open_time = models.TimeField()
    close_time = models.TimeField()
    open_status = models.CharField(max_length=50)
    field_name = models.CharField(max_length=100, default=None, null=True)
    field_choice = models.CharField(max_length=350)

    def __str__(self):
        return self.name


class Queue(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    reserve_time = models.DateTimeField()
    field_choice = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="Pending")

    def __str__(self):
        return f"{self.user} reserved at {self.business} status: {self.status}"
