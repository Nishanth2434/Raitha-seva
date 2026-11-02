import time
import jwt
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class SupabaseOrJWTAuthentication(BaseAuthentication):
    """
    Authenticates requests with either:
    1. Django SimpleJWT access token, or
    2. Supabase Bearer access token (verifying role='authenticated' and non-expired).
    """

    def authenticate_header(self, request):
        return 'Bearer realm="api"'

    def authenticate(self, request):
        auth_header = get_authorization_header(request).split()
        if not auth_header or auth_header[0].lower() != b"bearer":
            return None

        if len(auth_header) != 2:
            raise AuthenticationFailed("Invalid bearer token format.")

        token = auth_header[1].decode("utf-8")

        # 1. Attempt standard Django SimpleJWT authentication first
        try:
            simple_jwt_auth = JWTAuthentication()
            validated_token = simple_jwt_auth.get_validated_token(token)
            user = simple_jwt_auth.get_user(validated_token)
            if user:
                return (user, validated_token)
        except Exception:
            pass

        # 2. Attempt Supabase JWT authentication
        try:
            payload = jwt.decode(token, options={"verify_signature": False})

            # Check expiration
            exp = payload.get("exp")
            if exp and exp < time.time():
                raise AuthenticationFailed("Supabase session token has expired.")

            sub = payload.get("sub")
            role = payload.get("role")
            email = payload.get("email")

            if not sub or role not in ["authenticated", "service_role"]:
                raise AuthenticationFailed("Invalid Supabase token claims.")

            username = email if email else f"farmer_{sub[:8]}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={"email": email or "", "first_name": "Farmer"},
            )
            return (user, token)
        except AuthenticationFailed:
            raise
        except Exception as e:
            raise AuthenticationFailed(f"Token validation failed: {str(e)}")
