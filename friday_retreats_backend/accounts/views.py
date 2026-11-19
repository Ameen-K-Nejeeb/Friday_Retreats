from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import filters, generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

import requests
import secrets
import string

from .models import CustomUser, OTPRecord
from .permissions import IsAdminUser, IsHotelStaffUser
from .serializers import (
    AdminUserListSerializer,
    CustomTokenObtainPairSerializer,
    UserSignupSerializer,
)

from rest_framework.permissions import IsAuthenticated
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str

class CustomTokenObtainView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class HotelInventoryView(APIView):
    permission_classes = [IsHotelStaffUser]

    def get(self, request):
        return Response({"message": "Welcome to the Hotel Staff portal."})


class GlobalSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        return Response({"message": "Platform settings updated."})


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminUserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all().order_by('-date_joined')
    serializer_class = AdminUserListSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['email']

class AdminDeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Admin privileges required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_object_or_404(CustomUser, pk=pk)

        # Only prevent the logged-in admin from deleting themselves
        if user.id == request.user.id:
            return Response(
                {"error": "You cannot delete your own admin account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(
            {"message": "User permanently deleted."},
            status=status.HTTP_200_OK,
        )

class ToggleUserStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        if request.user.id == pk:
            return Response(
                {"error": "You cannot block or unblock your own admin account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_object_or_404(CustomUser, pk=pk)
        user.is_active = not user.is_active
        user.save()

        action = "unblocked" if user.is_active else "blocked"
        return Response(
            {
                "message": f"User {user.email} has been {action} successfully.",
                "is_active": user.is_active,
            },
            status=status.HTTP_200_OK,
        )


class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate 6-digit OTP
            otp = OTPRecord.generate_otp(user.email)

            # Send Verification Email
            send_mail(
                subject='Friday Retreats - Verify Your Email',
                message=(
                    f"Hi {user.first_name or 'there'},\n\n"
                    f"Your OTP for registration is: {otp}\n"
                    f"It is valid for 5 minutes."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response(
                {"message": "Registration successful. Please check your email for the OTP."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_submitted = request.data.get('otp')

        if not email or not otp_submitted:
            return Response(
                {"error": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            otp_record = OTPRecord.objects.get(email=email)
        except OTPRecord.DoesNotExist:
            return Response(
                {"error": "No OTP found for this email."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if otp_record.otp != str(otp_submitted).strip():
            return Response(
                {"error": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not otp_record.is_valid():
            otp_record.delete()
            return Response(
                {"error": "OTP has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_object_or_404(CustomUser, email=email)
        user.is_active = True
        user.save()

        otp_record.delete()

        return Response(
            {"message": "Email verified successfully! You can now log in."},
            status=status.HTTP_200_OK,
        )


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "No account found with this email."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_active:
            return Response(
                {"error": "This account is already verified. Please log in."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = OTPRecord.generate_otp(user.email)

        send_mail(
            subject='Friday Retreats - Your New Verification OTP',
            message=(
                f"Hi {user.first_name or 'there'},\n\n"
                f"Your new OTP for registration is: {otp}\n"
                f"It is valid for 5 minutes."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {"message": "A fresh OTP has been sent to your email."},
            status=status.HTTP_200_OK,
        )



class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "No account found with this email."}, status=status.HTTP_404_NOT_FOUND)

        otp = OTPRecord.generate_otp(user.email)

        send_mail(
            subject='Friday Retreats - Password Reset Code',
            message=(
                f"Hi {user.first_name or 'there'},\n\n"
                f"Your password reset OTP is: {otp}\n"
                f"It is valid for 5 minutes."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({"message": "Password reset OTP sent to your email."}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp_submitted = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not otp_submitted or not new_password:
            return Response(
                {"error": "Email, OTP, and new password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            otp_record = OTPRecord.objects.get(email=email)
        except OTPRecord.DoesNotExist:
            return Response({"error": "No OTP found for this email."}, status=status.HTTP_404_NOT_FOUND)

        if otp_record.otp != otp_submitted:
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        if not otp_record.is_valid():
            otp_record.delete()
            return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(CustomUser, email=email)
        user.set_password(new_password)
        user.save()
        otp_record.delete()

        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)


"""-------------------------------------------------------------google authentication ------------------------------------------------"""
class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response(
                {"error": "Google access token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify token and fetch user info from Google
        google_response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10,
        )

        if google_response.status_code != 200:
            return Response(
                {"error": "Invalid or expired Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_data = google_response.json()
        email = user_data.get('email', '').lower()
        first_name = user_data.get('given_name', '')
        last_name = user_data.get('family_name', '')

        if not email:
            return Response(
                {"error": "Google account does not have an email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get existing user or create a new active USER
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': CustomUser.Role.USER,
                'is_active': True,
            },
        )

        if created:
            user.set_unusable_password()
            user.save()
        elif not user.is_active:
            return Response(
                {"error": "This account has been blocked or deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generate SimpleJWT tokens with your custom claims (role, email, fr_coins_balance)
        refresh = CustomTokenObtainPairSerializer.get_token(user)

        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_200_OK,
        )


"""------------------------------------ staff invitations --------------------------------"""


class AdminInviteStaffView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Admin privileges required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        full_name = request.data.get('full_name', '').strip()
        email = request.data.get('email', '').strip().lower()
        phone_number = request.data.get('phone_number', '').strip()
        role = request.data.get('role', 'HOTEL_STAFF').upper()

        if not full_name or not email:
            return Response(
                {"error": "Full name and email address are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if role not in ['STAFF', 'HOTEL_STAFF', 'ADMIN']:
            return Response(
                {"error": "Invalid staff role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"error": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # Generate a secure temporary password
        alphabet = string.ascii_letters + string.digits + "!@#$"
        temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))

        user = CustomUser.objects.create_user(
            email=email,
            password=temp_password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            role=role,
            is_active=True,
            is_invite_pending=True,
            is_staff=(role == 'ADMIN'),
        )

        send_mail(
            subject='Friday Retreats - Staff Portal Invitation',
            message=(
                f"Hi {first_name},\n\n"
                f"You have been invited to join the Friday Retreats Staff Portal as {role.replace('_', ' ')}.\n\n"
                f"Login Email: {email}\n"
                f"Temporary Password: {temp_password}\n\n"
                f"Please sign in and use 'Forgot Password' to set your own password immediately."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "Staff invitation sent successfully.",
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED,
        )

class AdminResendInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Admin privileges required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_object_or_404(CustomUser, pk=pk)

        if not user.is_invite_pending:
            return Response(
                {"error": "This account has already been activated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        invite_link = f"{frontend_url}/set-password/{uid}/{token}"

        send_mail(
            subject='Friday Retreats - Reminder: Activate Your Staff Account',
            message=(
                f"Hi {user.first_name or 'there'},\n\n"
                f"Here is your fresh activation link for the Friday Retreats Portal:\n"
                f"{invite_link}\n\n"
                f"This link is valid for 24 hours and can only be used once."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {"message": f"Invitation resent to {user.email}."},
            status=status.HTTP_200_OK,
        )

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response({"error": "Admin privileges required."}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(CustomUser, pk=pk)
        return Response({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": getattr(user, 'phone_number', ''),
            "role": user.role,
            "is_active": user.is_active,
            "is_invite_pending": getattr(user, 'is_invite_pending', False),
            "fr_coins_balance": getattr(user, 'fr_coins_balance', 0),
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        }, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response({"error": "Admin privileges required."}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(CustomUser, pk=pk)
        data = request.data

        # Prevent self-deactivation
        if user.id == request.user.id and data.get('is_active') is False:
            return Response({"error": "You cannot deactivate your own admin account."}, status=status.HTTP_400_BAD_REQUEST)

        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
        if 'phone_number' in data and hasattr(user, 'phone_number'):
            user.phone_number = data['phone_number'].strip()
        if 'role' in data and data['role'] in ['USER', 'STAFF', 'HOTEL_STAFF', 'ADMIN']:
            user.role = data['role']
            user.is_staff = (data['role'] == 'ADMIN')
        if 'is_active' in data and user.role != 'ADMIN':
            user.is_active = bool(data['is_active'])
        if 'fr_coins_balance' in data and hasattr(user, 'fr_coins_balance'):
            user.fr_coins_balance = int(data['fr_coins_balance'])

        user.save()

        return Response({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": getattr(user, 'phone_number', ''),
            "role": user.role,
            "is_active": user.is_active,
            "fr_coins_balance": getattr(user, 'fr_coins_balance', 0),
            "date_joined": user.date_joined,
        }, status=status.HTTP_200_OK)



"""---------------------------------invitation admin, staff, hotel_staff ----------------------"""

class AdminInviteStaffView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Admin privileges required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        full_name = request.data.get('full_name', '').strip()
        email = request.data.get('email', '').strip().lower()
        phone_number = request.data.get('phone_number', '').strip()
        role = request.data.get('role', 'HOTEL_STAFF').upper()

        if not full_name or not email:
            return Response(
                {"error": "Full name and email address are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if role not in ['STAFF', 'HOTEL_STAFF', 'ADMIN']:
            return Response(
                {"error": "Invalid staff role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"error": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # Create inactive account with unusable password until invite is accepted
        user = CustomUser.objects.create_user(
            email=email,
            password=None,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            role=role,
            is_active=False,
            is_invite_pending=True,   
            is_staff=(role == 'ADMIN'),
        )
        user.set_unusable_password()
        user.save()

        # Generate signed, single-use onboarding link
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        invite_link = f"{frontend_url}/set-password/{uid}/{token}"

        send_mail(
            subject='Friday Retreats - Activate Your Staff Account',
            message=(
                f"Hi {first_name},\n\n"
                f"You have been invited to join the Friday Retreats Portal as {role.replace('_', ' ')}.\n\n"
                f"Click the link below to set your password and activate your account:\n"
                f"{invite_link}\n\n"
                f"This link is valid for 24 hours and can only be used once."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "Staff invitation link sent successfully.",
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED,
        )


class SetInvitedPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uid or not token or not new_password:
            return Response(
                {"error": "Invalid request. Missing token or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response(
                {"error": "This invitation link is invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "This invitation link has expired or has already been used."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.is_active = True
        user.is_invite_pending = False
        user.save()

        return Response(
            {"message": "Password set successfully. You can now sign in."},
            status=status.HTTP_200_OK,
        )