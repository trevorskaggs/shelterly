# Generated by Django 3.2.14 on 2024-03-25 19:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0032_alter_species_options'),
        ('vet', '0017_auto_20240228_1417'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='medicalrecord',
            name='patient',
        ),
    ]