# Generated by Django 3.2.14 on 2025-01-29 20:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evac', '0023_populate_id_for_incident'),
    ]

    operations = [
        migrations.AddField(
            model_name='evacassignment',
            name='dispatch_date',
            field=models.DateTimeField(null=True),
        ),
    ]
