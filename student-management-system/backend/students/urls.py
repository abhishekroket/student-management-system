from django.urls import path

from .views import (
    StudentListAPIView,
    StudentCreateAPIView,
    StudentUpdateAPIView,
    StudentDeleteAPIView,
)

urlpatterns = [
    path('', StudentListAPIView.as_view(), name='student-list'),
    path('create/', StudentCreateAPIView.as_view(), name='student-create'),
    path('<int:pk>/update/', StudentUpdateAPIView.as_view(), name='student-update'),
    path('<int:pk>/delete/', StudentDeleteAPIView.as_view(), name='student-delete'),
]

