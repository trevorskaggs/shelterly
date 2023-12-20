# Generated by Django 3.2.14 on 2023-11-11 19:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incident', '0004_alter_incident_slug'),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80)),
                ('slug', models.CharField(default='changeme', max_length=20, unique=True)),
                ('short_name', models.CharField(blank=True, max_length=40, null=True)),
                ('liability_name', models.CharField(max_length=80)),
                ('liability_short_name', models.CharField(max_length=40)),
            ],
        ),
    ]