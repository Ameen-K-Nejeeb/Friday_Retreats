from rest_framework_simplejwt.serializers import TokenObtainSerializer, TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['email'] = user.email
        token['fr_coins_balance'] = user.fr_coins_balance
        return token


class CustomTokenObtainPairView(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['email'] = user.email
        token['fr_coins_balance'] = user.fr_coins_balance

        return token