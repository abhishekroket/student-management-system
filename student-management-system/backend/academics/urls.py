from django.urls import path
from .views import SubjectListAPIView, MarksListAPIView

urlpatterns = [
    path('', SubjectListAPIView.as_view(), name='subject-list'),
    path('marks/', MarksListAPIView.as_view(), name='marks-list'),
]