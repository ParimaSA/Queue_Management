"""Provide models using in business app."""

from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from nanoid import generate
from django.forms import ModelForm

S3_BUCKET_NAME = settings.AWS_STORAGE_BUCKET_NAME


def get_default_profile_image():
    """Return the default profile image URL."""
    return f'https://{settings.AWS_S3_CUSTOM_DOMAIN}/profiles/default.png'


class Business(models.Model):
    """Business model to keep track of business owners' information."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    open_time = models.TimeField(default="06:00")
    close_time = models.TimeField(default="23:59")
    image = models.ImageField(
        blank=True,
        default='profiles/default.png',  # Default URL will be returned by the function
        upload_to="profiles/"  # S3 will store the image under the 'profiles/' directory
    )

    @property
    def profile_image_url(self):
        """Returns the full URL for the profile image or default image."""
        return self.image.url if self.image else get_default_profile_image()

    def __str__(self):
        """Return name of Business."""
        return self.name


class Queue(models.Model):
    """Represents a queue associated with a specific business."""

    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    prefix = models.CharField(max_length=1, default="A")
    estimated_time = models.IntegerField(null=True, blank=True)

    def __str__(self):
        """Return name of Queue."""
        return self.name


class Entry(models.Model):
    """Represents an entry in a queue for a specific business."""

    name = models.CharField(max_length=50)
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE, null=True)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, null=True)
    tracking_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    time_in = models.DateTimeField(default=timezone.now)
    time_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="waiting")

    def save(self, *args, **kwargs):
        """Generate tracking code and name for new entry."""
        if not self.tracking_code and self.status != "completed":
            new_tracking_code = generate("1234567890abcdefghijklmnopqrstuvwxyz", size=10)
            self.tracking_code = new_tracking_code

        if not self.name:
            today = timezone.localtime(timezone.now()).date()
            queue_entries_today = (
                Entry.objects.filter(queue=self.queue, time_in__date=today).count() + 1
            )
            self.name = f"{self.queue.prefix}{queue_entries_today}"

        super().save(*args, **kwargs)

    def mark_as_completed(self):
        """Update the entry's status to 'completed'."""
        self.status = "completed"
        self.time_out = timezone.now()
        self.tracking_code = None
        self.save()

    def get_queue_position(self) -> int:
        """Calculate the number of people ahead in the queue.

        Return:
            int: The number of entries ahead of this one in the queue.
        """
        today = timezone.localdate()
        if self.status != "waiting":
            return 0
        return Entry.objects.filter(
            queue=self.queue,
            business=self.business,
            time_in__lt=self.time_in,
            status="waiting",
            time_in__date=today
        ).count()

    def mark_as_cancel(self):
        """Update the entry's status to 'canceled'."""
        self.status = "cancel"
        self.tracking_code = None
        self.save()

    def is_waiting(self):
        """Check if the entry is in 'waiting' status."""
        return self.status == 'waiting'

    def __str__(self):
        """Return string representation of Entry's model."""
        return self.name


class QueueForm(ModelForm):
    """Form for creating and updating Queue instances."""

    class Meta:
        model = Queue
        fields = ["name", "prefix"]
