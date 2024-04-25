from django.db import migrations, models

def populate_id_for_incident(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Incident = apps.get_model("incident", "Incident")
    ServiceRequest = apps.get_model("hotline", "ServiceRequest")

    
    for incident in Incident.objects.using(db_alias).all():
        id_for_incident = 1
        for request in ServiceRequest.objects.using(db_alias).filter(incident=incident):
            request.id_for_incident = id_for_incident
            request.save()
            id_for_incident += 1

class Migration(migrations.Migration):

    dependencies = [
        ('hotline', '0022_servicerequest_id_for_incident'),
    ]

    operations = [
        migrations.RunPython(populate_id_for_incident, migrations.RunPython.noop)
    ]
