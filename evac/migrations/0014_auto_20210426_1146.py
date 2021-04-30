# Generated by Django 3.1.2 on 2021-04-26 18:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('hotline', '0016_auto_20210420_1128'),
        ('people', '0015_auto_20210426_1146'),
        ('evac', '0013_auto_20210420_1153'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignedrequest',
            name='followup_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='assignedrequest',
            name='owner_contact',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assigned_request', to='people.ownercontact'),
        ),
        migrations.AlterField(
            model_name='assignedrequest',
            name='visit_note',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assigned_request', to='hotline.visitnote'),
        ),
    ]