from django.db import migrations, models

def populate_id_for_incident(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Incident = apps.get_model("incident", "Incident")
    EvacAssignment = apps.get_model("evac", "EvacAssignment")

    for incident in Incident.objects.using(db_alias).all():
        id_for_incident = 1
        for da in EvacAssignment.objects.using(db_alias).filter(incident=incident):
            da.id_for_incident = id_for_incident
            da.save()
            id_for_incident += 1

class Migration(migrations.Migration):

    dependencies = [
        ('evac', '0022_auto_20240410_2109'),
    ]

    operations = [
        migrations.RunPython(populate_id_for_incident, migrations.RunPython.noop)
    ]
