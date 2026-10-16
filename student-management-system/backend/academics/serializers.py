from rest_framework import serializers
from .models import Marks, Subject

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"

class MarksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marks
        fields = "__all__"
        read_only_fields = ("total_marks", "grade")