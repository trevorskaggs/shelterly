# Generated by Django 3.1.2 on 2021-03-01 18:17

from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('evac', '0009_auto_20210301_0732'),
    ]

    operations = [
        migrations.AddField(
            model_name='dispatchteam',
            name='name',
            field=models.CharField(default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dispatchteam',
            name='dispatch_date',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
