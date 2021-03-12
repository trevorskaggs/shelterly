from django.contrib.auth.models import AbstractUser
from django.db import models
from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.auth.models import BaseUserManager
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.apps import apps

class ShelterlyUser(AbstractUser):

    cell_phone = models.CharField(max_length=50, blank=False, null=False)
    agency_id = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=False, null=False)

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

# Send email to user on user creation.
def email_new_user(sender, **kwargs):
    if kwargs["created"]:
        user = kwargs["instance"]
        ResetPasswordToken = apps.get_model('django_rest_passwordreset', 'ResetPasswordToken')
        token = ResetPasswordToken.objects.create(
            user=user,
        )

        # Send email here.
        send_mail(
            # title:
            "User Registered for Shelterly",
            # message:
            render_to_string(
                'registration_email.html',
                {
                'site': "http://localhost:3000",
                'token': token.key,
                }
            ).strip(),
            # from:
            "noreply@shelterly.org",
            # to:
            [user.email]
        )
post_save.connect(email_new_user, sender=ShelterlyUser)

# Send email to user when password reset is requested.
@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):

    # Send email here.
    send_mail(
        # title:
        "Password Reset for Shelterly",
        # message:
        render_to_string(
                'password_reset_email.html',
                {
                'site': "http://localhost:3000",
                'token': reset_password_token.key,
                }
            ).strip(),
        # from:
        "noreply@shelterly.org",
        # to:
        [reset_password_token.user.email]
    )