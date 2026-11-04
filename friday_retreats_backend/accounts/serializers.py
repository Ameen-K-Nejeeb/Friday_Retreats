from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomUser

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['role'] = user.role
        token['email'] = user.email
        token['fr_coins_balance'] = user.fr_coins_balance
        return token

class AdminTokenObtainSerializer(CustomTokenObtainPairSerializer):
    def validate(self, attrs):
        # This calls the parent validate, which returns the dictionary with access/refresh tokens
        data = super().validate(attrs)

        # Reject non-admin users
        if self.user.role != CustomUser.Role.ADMIN:
            raise AuthenticationFailed('Access Denied: Only administrators can access this portal.')
        
        return data