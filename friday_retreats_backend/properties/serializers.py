from rest_framework import serializers
from .models import DailyInventory, RoomType


class DailyInventorySerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source="room_type.name", read_only=True)
    available_rooms = serializers.ReadOnlyField()

    class Meta:
        model = DailyInventory
        fields = ['id', 'date', 'room_name', 'booked_count', 'blocked_count', 'available_rooms']