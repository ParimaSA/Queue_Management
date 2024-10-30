from importlib.metadata import entry_points

import helpers
from django.shortcuts import get_object_or_404
from ninja_extra import api_controller
from django.utils import timezone


@api_controller("/business")
class BusinessController:
    """Controller for managing business-related endpoints."""
    pass


@api_controller("/queue")
class QueueController:
    """Controller for managing queue-related endpoints."""
    pass


@api_controller("/entry")
class EntryController:
    """Controller for managing entry-related endpoints."""
    pass
