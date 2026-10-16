from django.db import models
from students.models import Student


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    course = models.CharField(max_length=100)
    semester = models.PositiveIntegerField()
    credits = models.PositiveIntegerField(default=4)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Marks(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='marks'
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='marks'
    )

    internal_marks = models.FloatField(default=0)
    external_marks = models.FloatField(default=0)
    total_marks = models.FloatField(default=0)
    grade = models.CharField(max_length=5, blank=True)
    semester = models.PositiveIntegerField()

    def save(self, *args, **kwargs):
        self.total_marks = self.internal_marks + self.external_marks

        if self.total_marks >= 90:
            self.grade = 'A+'
        elif self.total_marks >= 80:
            self.grade = 'A'
        elif self.total_marks >= 70:
            self.grade = 'B'
        elif self.total_marks >= 60:
            self.grade = 'C'
        elif self.total_marks >= 50:
            self.grade = 'D'
        else:
            self.grade = 'F'

        super().save(*args, **kwargs)