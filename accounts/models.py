from django.contrib.auth.models import AbstractUser
from django.db import models
from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail

class ShelterlyUser(AbstractUser):

    cell_phone = models.CharField(max_length=50, blank=False, null=False)
    agency_id = models.CharField(max_length=50, blank=True, null=True)
    # email = models.EmailField(unique=True) # changes email to unique and blank to false
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['cell_phone',] # removes email from REQUIRED_FIELDS

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):

    email_plaintext_message = "password_reset?token={}".format(reset_password_token.key)

    send_mail(
        # title:
        "Password Reset for Shelterly",
        # message:
        email_plaintext_message,
        # from:
        "noreply@somehost.local",
        # to:
        [reset_password_token.user.email]
    )