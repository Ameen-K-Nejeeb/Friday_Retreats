from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsHotelStaffUser
from .models import DailyInventory
from .serializers import DailyInventorySerializer


class InventoryMatrixView(APIView):
    permission_classes = [IsHotelStaffUser]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or end_date:
            return Response({'error' : 'Please provide start_date and end_date'}, status=status.HTTP_400_BAD_REQUEST)

        inventory = DailyInventory.objects.filter(date__range = [start_date, end_date]).select_related('room_type')

        serializer = DailyInventorySerializer(inventory, many=True)
        return Response(serializer.data)

    def patch(self, request):
        pass