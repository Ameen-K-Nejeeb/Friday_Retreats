from django.urls import path
from .views import (
    CustomTokenObtainView, 
    AdminUserListView, 
    ToggleUserStatusView, 
    RegisterUserView, 
    VerifyOTPView, 
    ResendOTPView,
    ForgotPasswordView,
    ResetPasswordView,
)

urlpatterns = [
    # The Single Unified Login Endpoint
    path('login/', CustomTokenObtainView.as_view(), name='user_login'),

    # Admin Management Endpoints (Protected by IsAdminUser in views)
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/toggle-status/', ToggleUserStatusView.as_view(), name='toggle_user_status'),
    
    # Registration & OTP
    path('register/', RegisterUserView.as_view(), name='user_register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend_otp'),

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]