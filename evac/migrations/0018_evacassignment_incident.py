# Generated by Django 3.1.2 on 2022-06-18 19:25

from django.db import migrations, models
import django.db.models.deletion
import evac.models


class Migration(migrations.Migration):

    dependencies = [
        ('incident', '0002_auto_20220618_0459'),
        ('evac', '0017_auto_20220524_1123'),
    ]

    operations = [
        migrations.AddField(
            model_name='evacassignment',
            name='incident',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='incident.incident'),
        ),
    ]
