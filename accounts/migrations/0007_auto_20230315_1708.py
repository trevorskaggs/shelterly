# Generated by Django 3.2.14 on 2023-03-15 21:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_auto_20220815_0731'),
    ]

    operations = [
        migrations.AddField(
            model_name='shelterlyuser',
            name='email_notification',
            field=models.BooleanField(default=False),
        ),
    ]