# Generated by Django 3.0.3 on 2020-05-24 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shelter', '0003_auto_20200321_1538'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='shelter',
        ),
        migrations.AlterField(
            model_name='building',
            name='description',
            field=models.CharField(blank=True, default='', max_length=400),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='room',
            name='description',
            field=models.CharField(blank=True, default='', max_length=400),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='shelter',
            name='address',
            field=models.CharField(blank=True, default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='shelter',
            name='apartment',
            field=models.CharField(blank=True, default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='shelter',
            name='city',
            field=models.CharField(blank=True, default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='shelter',
            name='description',
            field=models.CharField(blank=True, default='', max_length=400),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='shelter',
            name='image',
            field=models.ImageField(blank=True, default='', upload_to='media/images/shelter'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='shelter',
            name='state',
            field=models.CharField(blank=True, choices=[('AL', 'AL'), ('AK', 'AK'), ('AZ', 'AZ'), ('AR', 'AR'), ('CA', 'CA'), ('CO', 'CO'), ('CT', 'CT'), ('DE', 'DE'), ('FL', 'FL'), ('GA', 'GA'), ('HI', 'HI'), ('ID', 'ID'), ('IL', 'IL'), ('IN', 'IN'), ('IA', 'IA'), ('KS', 'KS'), ('KY', 'KY'), ('LA', 'LA'), ('ME', 'ME'), ('MD', 'MD'), ('MA', 'MA'), ('MI', 'MI'), ('MN', 'MN'), ('MS', 'MS'), ('MO', 'MO'), ('MT', 'MT'), ('NE', 'NE'), ('NV', 'NV'), ('NH', 'NH'), ('NJ', 'NJ'), ('NM', 'NM'), ('NY', 'NY'), ('NC', 'NC'), ('ND', 'ND'), ('OH', 'OH'), ('OK', 'OK'), ('PA', 'PA'), ('RI', 'RI'), ('SC', 'SC'), ('SD', 'SD'), ('TN', 'TN'), ('TX', 'TX'), ('VA', 'VA'), ('VT', 'VT'), ('WA', 'WA'), ('WV', 'WV'), ('WI', 'WI'), ('WY', 'WY')], default='', max_length=2),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='shelter',
            name='zip_code',
            field=models.CharField(blank=True, default='', max_length=50),
            preserve_default=False,
        ),
    ]
