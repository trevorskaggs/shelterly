from django.db import migrations, models

categories = ['Cat', 'Dog', 'Avian', 'Small Mammal', 'Reptile', 'Ruminant', 'Equine', 'Other']

species = [
  { 'name': 'alpaca', 'plural': 'alpacas', 'category':'ruminant' },
  { 'name': 'cat', 'plural': 'cats', 'category':'cat' },
  { 'name': 'chicken', 'plural': 'chickens', 'category':'avian' },
  { 'name': 'cow', 'plural': 'cows', 'category':'ruminant' },
  { 'name': 'dog', 'plural': 'dogs', 'category':'dog' },
  { 'name': 'donkey', 'plural': 'donkeys', 'category':'equine' },
  { 'name': 'duck', 'plural': 'ducks', 'category':'avian' },
  { 'name': 'emu', 'plural': 'emus', 'category':'avian' },
  { 'name': 'goat', 'plural': 'goats', 'category':'ruminant' },
  { 'name': 'horse', 'plural': 'horses', 'category':'equine' },
  { 'name': 'llama', 'plural': 'llamas', 'category':'ruminant' },
  { 'name': 'other', 'plural': 'others', 'category':'other' },
  { 'name': 'pig', 'plural': 'pigs', 'category':'ruminant' },
  { 'name': 'rabbit', 'plural': 'rabbits', 'category':'small mammal' },
  { 'name': 'sheep', 'plural': 'sheep', 'category':'ruminant' },
  { 'name': 'turkey', 'plural': 'turkeys', 'category':'avian' },
]

def create_species_and_categories(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Species = apps.get_model("animals", "Species")
    SpeciesCategory = apps.get_model("animals", "SpeciesCategory")
    Animal = apps.get_model("animals", "Animal")

    for category in categories:
        SpeciesCategory.objects.using(db_alias).get_or_create(name=category)

    for row in species:
        Species.objects.using(db_alias).get_or_create(name=row['name'], plural_name=row['plural'], category=SpeciesCategory.objects.using(db_alias).get(name__iexact=row['category']))

    names = [row['name'] for row in species]
    for name in names:
        Animal.objects.using(db_alias).filter(species=name).update(species_fk=Species.objects.using(db_alias).get(name__iexact=name))
    Animal.objects.using(db_alias).filter(species__name='bird').update(species_fk=Species.objects.using(db_alias).get(name__iexact='chicken'))

class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0028_animalspecies_speciescategory'),
    ]

    operations = [
        migrations.RunPython(create_species_and_categories, migrations.RunPython.noop)
    ]
