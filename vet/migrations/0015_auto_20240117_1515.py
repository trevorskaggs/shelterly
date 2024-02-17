# Generated by Django 3.2.14 on 2024-01-17 20:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vet', '0014_auto_20240108_1550'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='diagnosticresult',
            options={'ordering': ('-id',)},
        ),
        migrations.AlterModelOptions(
            name='examanswer',
            options={'ordering': ('question__name',)},
        ),
        migrations.AlterModelOptions(
            name='procedureresult',
            options={'ordering': ('-id',)},
        ),
        migrations.AlterModelOptions(
            name='treatmentplan',
            options={'ordering': ('-id',)},
        ),
        migrations.AddField(
            model_name='exam',
            name='vet_request',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='vet.vetrequest'),
        ),
    ]