from django.db import migrations, models


def clean_phone(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    ShelterlyUser = apps.get_model("accounts", "ShelterlyUser")
    for user in ShelterlyUser.objects.using(db_alias):
        clean_phone = user.cell_phone.replace(" ", "")
        user.cell_phone = clean_phone
        user.save()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0017_remove_shelterlyuserorg_email_notification'),
    ]

    operations = [
        migrations.RunPython(clean_phone, migrations.RunPython.noop)
    ]
