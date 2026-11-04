from django.db import models

# Create your models here.

from django.conf import settings




class Hotel(models.Model):
    name = models.CharField(max_length=224)
    slug = models.SlugField(unique=True, max_length=224)
    description = models.TextField()
    address = models.TextField()
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()


    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                null=True, blank=True, limit_choices_to={'role': 'HOTEL_STAFF'}
                                )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



class RoomType(models.Model):
    hotel = models.ForeignKey(Hotel, related_name='room_types', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    max_adults = models.PositiveIntegerField(default=2)
    max_children = models.PositiveIntegerField(default=1)

    total_inventory = models.PositiveIntegerField(default=0)

    base_price_per_night = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.hotel.name} - {self.name}"


class DailyInventory(models.Model):
    room_type = models.ForeignKey(RoomType, related_name='daily_inventories', on_delete=models.CASCADE)
    date = models.DateField()

    booked_count = models.PositiveIntegerField(default=0)
    blocked_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('room_type', 'date')
        indexes = [
            models.Index(fields=['date', 'room_type']),
        ]

    @property
    def available_rooms(self):
        return self.room_type.total_inventory  - (self.booked_count + self.blocked_count)

    def __str__(self):
        return f"{self.date}: {self.room_type.name} - {self.available_rooms} Available"