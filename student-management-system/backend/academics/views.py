from rest_framework import generics
from .models import Subject, Marks
from .serializers import SubjectSerializer, MarksSerializer


class SubjectListAPIView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class MarksListAPIView(generics.ListAPIView):
    queryset = Marks.objects.all()
    serializer_class = MarksSerializer