# Generated by Django 3.0.4 on 2020-04-16 17:06

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('evac', '0002_auto_20191103_2219'),
    ]

    operations = [
        #migrations.AlterField(
        #    model_name='evacteam',
        #    name='evac_team_members',
        #    field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        #),
    ]
