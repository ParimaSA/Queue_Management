"""Api routes for public."""
import helpers
from ninja_extra import api_controller, http_get

@api_controller("/public")
class PublicController:
    """Controller for managing public endpoints."""

    @http_get("/ping")
    def ping(self, request):
        """API for keeping the backend alive."""
        return {"message": "Server is alive"}
