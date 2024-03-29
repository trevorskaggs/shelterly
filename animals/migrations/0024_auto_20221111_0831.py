# Generated by Django 3.2.14 on 2022-11-11 16:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0023_auto_20220618_1220'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='animal',
            options={'ordering': ('order', 'id')},
        ),
        migrations.AlterField(
            model_name='animal',
            name='age',
            field=models.CharField(blank=True, max_length=10),
        ),
        migrations.AlterField(
            model_name='animal',
            name='pcolor',
            field=models.CharField(blank=True, max_length=50, verbose_name='Primary Color'),
        ),
        migrations.AlterField(
            model_name='animal',
            name='scolor',
            field=models.CharField(blank=True, max_length=50, verbose_name='Secondary Color'),
        ),
        migrations.AlterField(
            model_name='animal',
            name='species',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AlterField(
            model_name='animal',
            name='status',
            field=models.CharField(choices=[('REPORTED', 'REPORTED'), ('REUNITED', 'REUNITED'), ('SHELTERED', 'SHELTERED'), ('SHELTERED IN PLACE', 'SHELTERED IN PLACE'), ('UNABLE TO LOCATE', 'UNABLE TO LOCATE'), ('NO FURTHER ACTION', 'NO FURTHER ACTION'), ('DECEASED', 'DECEASED'), ('CANCELED', 'CANCELED')], default='REPORTED', max_length=25),
        ),
    ]
