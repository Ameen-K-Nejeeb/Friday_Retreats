from django.db import models
from django.conf import settings
from properties.models import RoomType

class Booking(models.Model):

    class BookingStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review/Payment'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed Stay'


    class PaymentStatus(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PROCESSING = 'PROCESSING' , 'Processing'
        PAID = 'PAID', 'Paid'
        REFUNDED = 'REFUNDED', 'Refunded'

    booking_reference = models.CharField(max_length=20, unique=True, db_index=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='bookings', on_delete=models.PROTECT)
    room_type = models.ForeignKey(RoomType, on_delete=models.PROTECT)

    check_in = models.DateField()
    check_out = models.DateField()
    guests_count = models.PositiveIntegerField(default=2)

    base_fare = models.DecimalField(max_digits=10, decimal_places=2)
    taxes_and_fees = models.DecimalField(max_digits=10, decimal_places=2)

    fr_coins_applied = models.PositiveIntegerField(default=0)

    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    
    payment_status = models.CharField(
        max_length=20, 
        choices=PaymentStatus.choices,  
        default=PaymentStatus.UNPAID
    )

    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_reference} - {self.user.email}"