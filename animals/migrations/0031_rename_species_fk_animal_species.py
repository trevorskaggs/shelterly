# Generated by Django 3.2.14 on 2023-12-20 20:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0030_auto_20231220_1235'),
    ]

    operations = [
        migrations.RenameField(
            model_name='animal',
            old_name='species_fk',
            new_name='species',
        ),
    ]
