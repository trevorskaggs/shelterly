# Generated by Django 3.2.14 on 2024-08-28 14:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vet', '0018_remove_medicalrecord_patient'),
    ]

    operations = [
        migrations.CreateModel(
            name='TreatmentPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'ordering': ('-id',),
            },
        ),
        migrations.AlterModelOptions(
            name='examquestion',
            options={'ordering': ('id',)},
        ),
        migrations.AddField(
            model_name='treatmentrequest',
            name='treatment_plan',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='vet.treatmentplan'),
        ),
    ]
