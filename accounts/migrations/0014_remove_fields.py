# Generated by Django 3.2.14 on 2023-11-21 19:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0013_default_org'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shelterlyuser',
            name='email_notification',
        ),
        migrations.RemoveField(
            model_name='shelterlyuser',
            name='incident_perms',
        ),
        migrations.RemoveField(
            model_name='shelterlyuser',
            name='user_perms',
        ),
    ]
