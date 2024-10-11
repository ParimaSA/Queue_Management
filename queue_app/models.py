from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

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

    DAYS = {0: 'Monday',
            1: 'Tuesday',
            2: 'Wednesday',
            3: 'Thursday',
            4: 'Friday',
            5: 'Saturday',
            6: 'Sunday'}

    @staticmethod
    def convert_to_list(my_str) -> list[str]:
        return [i.strip() for i in my_str.split(',')]

    def is_approved(self) -> bool:
        """Check if the business was approved by admin
        Return: bool
        """
        return self.approve_status == "Approved"

    def is_opened(self):
        """Check if the business is in condition to book a queue.
        Return: bool: True if the business is open today,
        the business has already been approved by admin,
        and the current time falls between opening and ending times.
        """

        days_lst = Business.convert_to_list(self.open_day)

        today_day_int = timezone.now().weekday()

        try:
            today_day = Business.DAYS[today_day_int]
        except KeyError:
            return False

        now = timezone.localtime(timezone.now()).time()

        # same day open and close
        if now > self.open_time:
            check_time = self.open_time <= now <= self.close_time
        else:  # edge case
            check_time = self.open_time >= now and self.close_time >= now
        return (today_day in days_lst and check_time
                and self.is_approved() and self.open_status == 'Open')

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
