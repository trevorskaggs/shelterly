# Generated by Django 3.2.14 on 2023-06-17 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evac', '0019_dispatchteam_incident'),
    ]

    operations = [
        migrations.AddField(
            model_name='evacassignment',
            name='closed',
            field=models.BooleanField(default=False),
        ),
    ]
