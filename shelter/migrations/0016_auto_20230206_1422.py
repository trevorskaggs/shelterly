# Generated by Django 3.2.14 on 2023-02-06 19:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('people', '0019_auto_20220602_0851'),
        ('shelter', '0015_intakesummary'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='intakesummary',
            options={'ordering': ['-id']},
        ),
        migrations.AddField(
            model_name='intakesummary',
            name='person',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='people.person'),
        ),
        migrations.AlterField(
            model_name='intakesummary',
            name='intake_type',
            field=models.CharField(default='walkin', max_length=20),
        ),
    ]