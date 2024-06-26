# Generated by Django 3.1.2 on 2022-06-18 19:20

import animals.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('incident', '0008_auto_20231206_1109'),
        ('animals', '0022_auto_20220602_0851'),
    ]

    operations = [
        migrations.AddField(
            model_name='animal',
            name='incident',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='incident.incident'),
        ),
        migrations.AlterField(
            model_name='animal',
            name='status',
            field=models.CharField(choices=[('REPORTED', 'REPORTED'), ('REUNITED', 'REUNITED'), ('SHELTERED', 'SHELTERED'), ('SHELTERED IN PLACE', 'SHELTERED IN PLACE'), ('UNABLE TO LOCATE', 'UNABLE TO LOCATE'), ('NOT FOUND', 'NOT FOUND'), ('DECEASED', 'DECEASED'), ('CANCELED', 'CANCELED')], default='REPORTED', max_length=25),
        ),
    ]
