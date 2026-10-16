from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        'student',
        'subject',
        'date',
        'status',
    )

    list_filter = (
        'date',
        'status',
        'subject',
    )

    search_fields = (
        'student__full_name',
        'student__roll_number',
    )