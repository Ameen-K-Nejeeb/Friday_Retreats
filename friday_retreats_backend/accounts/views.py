from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import IsHotelStaffUser, IsAdminUser

# Create your views here.
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    CustomTokenObtainPairSerializer,
    
)


class CustomTokenObtainView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    # Tell the view to use our overridden serializer
    serializer_class = CustomTokenObtainPairSerializer



class HotelInventoryView(APIView):
    permission_classes = [IsHotelStaffUser]

    def get(self, request):
        return Response({"message" : "Welcome to the Hotel Staff portal. "})

class GlobalSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        return Response({"message": "Platform settings updated. "})