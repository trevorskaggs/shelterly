from django.db import migrations, models


def populate_user_default_org(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Organization = apps.get_model("incident", "Organization")
    ShelterlyUser = apps.get_model("accounts", "ShelterlyUser")
    default_org = Organization.objects.using(db_alias).first()
    for user in ShelterlyUser.objects.using(db_alias):
        user.organization.add(default_org)

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_auto_20231121_1103'),
    ]

    operations = [
        migrations.RunPython(populate_user_default_org)
    ]
