# Generated by Django 3.2.14 on 2024-01-04 23:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0031_rename_species_fk_animal_species'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='species',
            options={'ordering': ('name',), 'verbose_name_plural': 'Species'},
        ),
    ]