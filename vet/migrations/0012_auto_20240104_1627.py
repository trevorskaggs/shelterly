# Generated by Django 3.2.14 on 2024-01-05 00:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vet', '0011_auto_20240104_1558'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='diagnosticresult',
            name='vet_request',
        ),
        migrations.RemoveField(
            model_name='treatmentplan',
            name='vet_request',
        ),
        migrations.AddField(
            model_name='diagnosticresult',
            name='medical_record',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='vet.medicalrecord'),
        ),
        migrations.AddField(
            model_name='treatmentplan',
            name='medical_record',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='vet.medicalrecord'),
        ),
        migrations.RenameField(
            model_name='vetrequest',
            old_name='requested',
            new_name='requested_by',
        ),
        migrations.AlterField(
            model_name='medicalrecord',
            name='patient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='medical_record', to='animals.animal'),
        ),
        migrations.RemoveField(
            model_name='medicalrecord',
            name='exam',
        ),
        migrations.AddField(
            model_name='exam',
            name='medical_record',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='vet.medicalrecord'),
        ),
        migrations.AddField(
            model_name='exam',
            name='pulse',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exam',
            name='respiratory_rate',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='vetrequest',
            name='caution',
            field=models.BooleanField(default=False),
        ),
        migrations.RemoveField(
            model_name='medicalrecord',
            name='status',
        ),
        migrations.AddField(
            model_name='medicalrecord',
            name='medical_status',
            field=models.CharField(default='Healthy', max_length=20),
        ),
        migrations.AddField(
            model_name='vetrequest',
            name='status',
            field=models.CharField(default='Open', max_length=20),
        ),
    ]
