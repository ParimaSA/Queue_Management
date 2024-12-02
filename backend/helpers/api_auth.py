"""Provide models and authentication configurations used in the business app."""

from ninja_jwt.authentication import JWTAuth


def allow_not_authenticate(request):
    """Check if a user is not authenticated."""
    if not request.user.is_authenticated:
        return True


api_auth_user_required = [JWTAuth()]
api_auth_user_or_guest = [JWTAuth(), allow_not_authenticate]
