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
    AdminDeleteUserView,
    AdminInviteStaffView,
    AdminUserDetailView,
    SetInvitedPasswordView,
    AdminResendInviteView,

    GoogleAuthView,
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

    path('google-auth/', GoogleAuthView.as_view(), name='google-auth'),
    path('admin/users/<int:pk>/delete/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
    path('admin/staff/invite/', AdminInviteStaffView.as_view(), name='admin-invite-staff'),

    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),

    path('set-password/', SetInvitedPasswordView.as_view(), name='set-invited-password'),
    path('admin/staff/<int:pk>/resend-invite/', AdminResendInviteView.as_view(), name='admin-resend-invite'),
]