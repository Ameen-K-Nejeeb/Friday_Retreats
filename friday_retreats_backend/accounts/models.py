# accounts/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

import random
from django.utils import timezone
from datetime import timedelta
import secrets


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        extra_fields.setdefault('role', 'ADMIN') 

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        STAFF = 'STAFF', 'Staff'
        HOTEL_STAFF = 'HOTEL_STAFF', 'Hotel Staff'
        USER = 'USER', 'User'
        
    username = None 
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    fr_coins_balance = models.IntegerField(default=0)

    # Tell Django to use our custom manager
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] 
    def __str__(self):
        return f"{self.email} - {self.role}"



class OTPRecord(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)

    @classmethod
    def generate_otp(cls, email):
        otp_code = f"{secrets.randbelow(1000000):06d}"
        cls.objects.update_or_create(
            email=email,
            defaults={
                'otp': otp_code,
                'created_at': timezone.now(),
            }
        )
        return otp_code

    def is_valid(self):
        return timezone.now() <= self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"{self.email} - {self.otp}"