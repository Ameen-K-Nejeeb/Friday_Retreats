from django.urls import path
from .views import AdminLoginView, CustomTokenObtainView

urlpatterns = [

    path('login/', CustomTokenObtainView.as_view(), name='user_login'),

    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
]