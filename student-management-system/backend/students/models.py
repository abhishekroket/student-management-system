from django.db import models
from accounts.models import User


class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )

    roll_number = models.CharField(
        max_length=30,
        unique=True
    )

    full_name = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=15)

    course = models.CharField(max_length=100)

    semester = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.roll_number} - {self.full_name}"