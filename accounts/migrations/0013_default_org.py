from django.db import migrations, models


def populate_user_default_org(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Organization = apps.get_model("incident", "Organization")
    ShelterlyUser = apps.get_model("accounts", "ShelterlyUser")
    ShelterlyUserOrg = apps.get_model("accounts", "ShelterlyUserOrg")
    default_org = Organization.objects.using(db_alias).first()
    for user in ShelterlyUser.objects.using(db_alias):
        user.organizations.add(default_org)
        ShelterlyUserOrg.objects.using(db_alias).get_or_create(user=user, organization=default_org, user_perms=user.user_perms, incident_perms=user.incident_perms, email_notification=user.email_notification)

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_auto_20231121_1103'),
    ]

    operations = [
        migrations.RunPython(populate_user_default_org, migrations.RunPython.noop)
    ]
