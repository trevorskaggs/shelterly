# Generated by Django 3.2.14 on 2024-04-11 01:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evac', '0021_evacteammember_training'),
    ]

    operations = [
        migrations.AddField(
            model_name='evacassignment',
            name='id_for_incident',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
