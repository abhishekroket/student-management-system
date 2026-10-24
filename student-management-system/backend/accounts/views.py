from django.db import connection
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.middleware.csrf import get_token

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token_view(request):
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    User = get_user_model()
    db_user = User.objects.filter(username=username).first()

    print("LOGIN DEBUG - database engine:", connection.settings_dict["ENGINE"])
    print("LOGIN DEBUG - database name:", connection.settings_dict["NAME"])
    print("LOGIN DEBUG - username found:", db_user is not None)

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid username or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    login(request, user)

    return Response({
        'message': 'Login successful.',
        'username': user.username,
        'role': user.role,
    })


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'role': request.user.role,
    })

