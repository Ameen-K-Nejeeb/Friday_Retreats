from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import filters, generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, OTPRecord
from .permissions import IsAdminUser, IsHotelStaffUser
from .serializers import (
    AdminUserListSerializer,
    CustomTokenObtainPairSerializer,
    UserSignupSerializer,
)


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