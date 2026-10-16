from django.urls import path
from .views import AttendanceListAPIView

urlpatterns = [
    path('', AttendanceListAPIView.as_view(), name='attendance-list'),
]