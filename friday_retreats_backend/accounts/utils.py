import secrets
from django.core.mail import send_mail
from django.conf import settings
from .models import OTPRecord

def generate_and_send_email_otp(user):
    # Clear any previous unused OTPs for this user
    OTPRecord.objects.filter(user=user).delete()

    # Generate a secure 6-digit OTP
    otp_code = f"{secrets.randbelow(1000000):06d}"

    # Save to database
    OTPRecord.objects.create(user=user, otp=otp_code)

    # Send email
    subject = "Your Friday Retreats Verification Code"
    message = (
        f"Hi {user.first_name or 'there'},\n\n"
        f"Your 6-digit verification code for Friday Retreats is: {otp_code}\n\n"
        f"This code will expire in 5 minutes.\n"
        f"If you did not request this, please ignore this email."
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return otp_code