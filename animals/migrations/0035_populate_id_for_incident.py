from django.db import migrations, models

def populate_id_for_incident(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Incident = apps.get_model("incident", "Incident")
    Animal = apps.get_model("animals", "Animal")

    for incident in Incident.objects.using(db_alias).all():
        id_for_incident = 1
        for animal in Animal.objects.using(db_alias).filter(incident=incident):
            animal.id_for_incident = id_for_incident
            animal.save()
            id_for_incident += 1

class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0034_animal_id_for_incident'),
    ]

    operations = [
        migrations.RunPython(populate_id_for_incident, migrations.RunPython.noop)
    ]
