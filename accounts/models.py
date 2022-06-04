from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.sites.models import Site
from django.db.models.signals import post_save
from django.db import models
from django.apps import apps

class ShelterlyUserManager(BaseUserManager):
    def create_user(self, email, cell_phone, password=None, **extra_fields):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            cell_phone=cell_phone,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, cell_phone, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            email,
            password=password,
            cell_phone=cell_phone,
            **extra_fields
        )
        user.is_staff = True
        user.save(using=self._db)
        return user

    # Customize to allow case insensitive email login.
    def get_by_natural_key(self, email):
        return self.get(email__iexact=email)

class ShelterlyUser(AbstractUser):

    first_name = models.CharField(max_length=50, blank=False, null=False)
    last_name = models.CharField(max_length=50, blank=False, null=False)
    cell_phone = models.CharField(max_length=50, blank=False, null=False)
    agency_id = models.CharField(max_length=50, blank=True, null=True)
    username = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=False, null=False, unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['cell_phone']

    objects = ShelterlyUserManager()

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

    class Meta:
        ordering = ('last_name',)

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
