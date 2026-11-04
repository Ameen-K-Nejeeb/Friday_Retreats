from django.db import models

# Create your models here.
from django.conf import settings
from bookings.models import Booking


class FRCoinTransaction(models.Model):
    class TransactionType(models.TextChoices):
        WELCOME_BONUS = 'WELCOME_BONUS', 'Welcome Bonous'
        BOOKING_REWARD = 'BOOKING_REWARD', 'Booking Reward'
        REDEMPTION = 'REDEMPTION', 'Folio Offset Redemption'
        REFUND = 'REFUND', 'Refund Reversal'
        REFERRAL = 'REFERRAL', 'Referral Bonus'
        MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT', 'Sec-Ops Manual Adjustment'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='coin_transactions', on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)

    amount = models.IntegerField()
    balance_after = models.IntegerField()
    related_booking = models.ForeignKey(Booking, null=True, blank=True, on_delete=models.SET_NULL)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        direction = "+" if self.amount > 0 else ""
        return f"{self.user.email} | {direction}{self.amount} FR | {self.transaction_type}"
