import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or repair an admin or student account."

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

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "role": role,
                "is_staff": role == "admin",
                "is_superuser": role == "admin",
            },
        )

        user.role = role

        if role == "admin":
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True

        user.set_password(password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} account '{user.username}' "
                f"with role '{user.role}'."
            )
        )

