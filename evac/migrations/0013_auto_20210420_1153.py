# Generated by Django 3.1.2 on 2021-04-20 18:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('hotline', '0016_auto_20210420_1128'),
        ('people', '0014_auto_20210420_1128'),
        ('evac', '0012_services_requests_through'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='AssignedRequests',
            new_name='AssignedRequest',
        ),
        migrations.AlterField(
            model_name='assignedrequest',
            name='owner_contact',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='people.ownercontact'),
        ),
        migrations.AlterField(
            model_name='assignedrequest',
            name='visit_note',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='hotline.visitnote'),
        ),
    ]
