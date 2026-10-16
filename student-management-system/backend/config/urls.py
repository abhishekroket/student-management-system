from django.contrib import admin
from django.urls import path, include
from accounts.views import csrf_token_view, login_view, logout_view, current_user_view

urlpatterns = [
path('admin/', admin.site.urls),


path('api/students/', include('students.urls')),
path('api/subjects/', include('academics.urls')),
path('api/attendance/', include('attendance.urls')),

path('api/auth/csrf/', csrf_token_view, name='csrf-token'),
path('api/auth/login/', login_view, name='login'),
path('api/auth/logout/', logout_view, name='logout'),
path('api/auth/me/', current_user_view, name='current-user'),


]
