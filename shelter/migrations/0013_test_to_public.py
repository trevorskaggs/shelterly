from django.db import migrations


def populate_public(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Shelter = apps.get_model("shelter", "Shelter")
    Shelter.objects.using(db_alias).filter(test=False).update(public=True)

class Migration(migrations.Migration):

    dependencies = [
        ('shelter', '0012_auto_20220808_1343'),
    ]

    operations = [
        migrations.RunPython(populate_public)
    ]
