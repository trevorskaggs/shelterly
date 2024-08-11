from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evac', '0023_populate_id_for_incident'),
    ]

    operations = [
        migrations.AddField(
            model_name='dispatchteam',
            name='default_name',
            field=models.BooleanField(default=False),
        ),
    ]
