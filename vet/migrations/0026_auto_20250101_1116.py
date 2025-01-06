# Generated by Django 3.2.14 on 2025-01-01 19:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vet', '0025_auto_20241218_1322'),
    ]

    operations = [
        migrations.AlterField(
            model_name='diagnosticresult',
            name='open',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='procedureresult',
            name='open',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='treatmentrequest',
            name='route',
            field=models.CharField(blank=True, max_length=8, null=True),
        ),
        migrations.AlterField(
            model_name='treatmentrequest',
            name='unit',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='vetrequest',
            name='open',
            field=models.DateTimeField(),
        ),
    ]