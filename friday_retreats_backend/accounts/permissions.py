from rest_framework.permissions import BasePermission
from .models import CustomUser


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == CustomUser.Role.ADMIN)

class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in [CustomUser.Role.ADMIN, CustomUser.Role.STAFF]
        )

class IsHotelStaffUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in [CustomUser.Role.ADMIN, CustomUser.Role.HOTEL_STAFF]
        )


class IsAssignedHotelStaff(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == CustomUser.Role.ADMIN:
            return True

        if request.user.role == CustomUser.Role.HOTEL_STAFF:
            return obj.hotel_id == request.user.hotel_assignment_id
        
        return False