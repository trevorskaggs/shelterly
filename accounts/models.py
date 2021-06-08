from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.sites.models import Site
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.db import models
from django.apps import apps

class ShelterlyUserManager(BaseUserManager):
    # Customize to allow case insensitive email login.
    def get_by_natural_key(self, email):
        return self.get(email__iexact=email)

class ShelterlyUser(AbstractUser):

    cell_phone = models.CharField(max_length=50, blank=False, null=False)
    agency_id = models.CharField(max_length=50, blank=True, null=True)
    username = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=False, null=False, unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['cell_phone']

    objects = ShelterlyUserManager()

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
                'registration_email.txt',
                {
                'site': Site.objects.get_current(),
                'token': token.key,
                }
            ).strip(),
            # from:
            "DoNotReply@shelterly.org",
            # to:
            [user.email],
            fail_silently=False,
            html_message = render_to_string(
                'registration_email.html',
                {
                'site': Site.objects.get_current(),
                'token': token.key,
                }
            ).strip()
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
                'password_reset_email.txt',
                {
                'site': Site.objects.get_current(),
                'token': reset_password_token.key,
                }
            ).strip(),
        # from:
        "DoNotReply@shelterly.org",
        # to:
        [reset_password_token.user.email],
        fail_silently=False,
        html_message = render_to_string(
            'password_reset_email.html',
            {
            'site': Site.objects.get_current(),
            'token': reset_password_token.key,
            }
        ).strip()
    )
