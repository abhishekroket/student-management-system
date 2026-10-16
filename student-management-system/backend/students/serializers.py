from django.db import transaction
from rest_framework import serializers
from accounts.models import User
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        write_only=True,
        required=False
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=False
    )

    class Meta:
        model = Student
        fields = [
            'id',
            'username',
            'password',
            'roll_number',
            'full_name',
            'email',
            'phone',
            'course',
            'semester',
            'user',
        ]
        read_only_fields = ['id', 'user']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "This username already exists. Please choose another username."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=username,
            password=password,
            email=validated_data['email'],
            role='student',
        )

        student = Student.objects.create(
            user=user,
            **validated_data,
        )

        return student

    def update(self, instance, validated_data):
    # Update only the supplied student fields.
        validated_data.pop('username', None)
        validated_data.pop('password', None)

        return super().update(instance, validated_data)