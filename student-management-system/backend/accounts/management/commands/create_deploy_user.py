import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create an admin or student account."

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.environ.get("NEW_USERNAME")
        password = os.environ.get("NEW_PASSWORD")
        role = os.environ.get("NEW_USER_ROLE", "admin")

        if not username or not password:
            raise CommandError(
                "Set NEW_USERNAME and NEW_PASSWORD first."
            )

        if role not in ("admin", "student"):
            raise CommandError("Role must be admin or student.")

        if User.objects.filter(username=username).exists():
            raise CommandError("This username already exists.")

        user = User.objects.create_user(
            username=username,
            password=password,
            role=role,
            is_staff=(role == "admin"),
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {user.username} with role {user.role}"
            )
        )