# Generated by Django 3.2.14 on 2024-01-31 17:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vet', '0015_auto_20240117_1515'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='treatmentrequest',
            options={'ordering': ('-id',)},
        ),
        migrations.RemoveField(
            model_name='treatmentrequest',
            name='treatment_plan',
        ),
        migrations.AddField(
            model_name='treatmentrequest',
            name='medical_record',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='vet.medicalrecord'),
        ),
        migrations.AddField(
            model_name='treatmentrequest',
            name='quantity',
            field=models.FloatField(blank=True, default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='treatmentrequest',
            name='route',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
        migrations.AddField(
            model_name='treatmentrequest',
            name='treatment',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='vet.treatment'),
        ),
        migrations.AddField(
            model_name='treatmentrequest',
            name='unit',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
        migrations.DeleteModel(
            name='TreatmentPlan',
        ),
    ]