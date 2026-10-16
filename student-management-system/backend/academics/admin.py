from django.contrib import admin
from .models import Subject, Marks


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = (
        'code',
        'name',
        'course',
        'semester',
        'credits',
    )

    search_fields = (
        'name',
        'code',
    )


@admin.register(Marks)
class MarksAdmin(admin.ModelAdmin):
    list_display = (
        'student',
        'subject',
        'semester',
        'total_marks',
        'grade',
    )

    list_filter = (
        'semester',
        'grade',
    )