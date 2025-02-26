from django.db import migrations, models

categories = ['cat', 'dog', 'avian', 'small mammal', 'reptile/amphibian', 'camelid', 'ruminant', 'equine', 'swine', 'other']

species = [
    {'name': 'alpaca', 'plural': 'alpacas', 'category': 'camelid'},
    {'name': 'cat', 'plural': 'cats', 'category': 'cat'},
    {'name': 'chicken', 'plural': 'chickens', 'category': 'avian'},
    {'name': 'cockatoo', 'plural': 'cockatoos', 'category': 'avian'},
    {'name': 'cow', 'plural': 'cows', 'category': 'ruminant'},
    {'name': 'dog', 'plural': 'dogs', 'category': 'dog'},
    {'name': 'donkey', 'plural': 'donkeys', 'category': 'equine'},
    {'name': 'duck', 'plural': 'ducks', 'category': 'avian'},
    {'name': 'emu', 'plural': 'emus', 'category': 'avian'},
    {'name': 'ferret', 'plural': 'ferrets', 'category': 'small mammal'},
    {'name': 'finch', 'plural': 'finches', 'category': 'avian'},
    {'name': 'fish (freshwater)', 'plural': 'fishes (freshwater)', 'category': 'other'},
    {'name': 'fish (salt water)', 'plural': 'fishes (salt water)', 'category': 'other'},
    {'name': 'frog', 'plural': 'frogs', 'category': 'reptile/amphibian'},
    {'name': 'gerbil', 'plural': 'gerbils', 'category': 'small mammal'},
    {'name': 'goat', 'plural': 'goats', 'category': 'ruminant'},
    {'name': 'goose', 'plural': 'geese', 'category': 'avian'},
    {'name': 'guineafowl', 'plural': 'guineafowls', 'category': 'avian'},
    {'name': 'guinea pig', 'plural': 'guinea pigs', 'category': 'small mammal'},
    {'name': 'hamster', 'plural': 'hamsters', 'category': 'small mammal'},
    {'name': 'hedgehog', 'plural': 'hedgehogs', 'category': 'small mammal'},
    {'name': 'horse', 'plural': 'horses', 'category': 'equine'},
    {'name': 'lizard', 'plural': 'lizards', 'category': 'reptile/amphibian'},
    {'name': 'llama', 'plural': 'llamas', 'category': 'camelid'},
    {'name': 'mouse', 'plural': 'mice', 'category': 'small mammal'},
    {'name': 'mule', 'plural': 'mules', 'category': 'equine'},
    {'name': 'newt', 'plural': 'newts', 'category': 'reptile/amphibian'},
    {'name': 'other', 'plural': 'others', 'category': 'other'},
    {'name': 'parakeet', 'plural': 'parakeets', 'category': 'avian'},
    {'name': 'parrot', 'plural': 'parrots', 'category': 'avian'},
    {'name': 'peacock', 'plural': 'peacocks', 'category': 'avian'},
    {'name': 'pheasant', 'plural': 'pheasants', 'category': 'avian'},
    {'name': 'pig', 'plural': 'pigs', 'category': 'swine'},
    {'name': 'pigeon', 'plural': 'pigeons', 'category': 'avian'},
    {'name': 'quail', 'plural': 'quails', 'category': 'avian'},
    {'name': 'rabbit', 'plural': 'rabbits', 'category': 'small mammal'},
    {'name': 'rat', 'plural': 'rats', 'category': 'small mammal'},
    {'name': 'salamander', 'plural': 'salamanders', 'category': 'reptile/amphibian'},
    {'name': 'sheep', 'plural': 'sheep', 'category': 'ruminant'},
    {'name': 'snake', 'plural': 'snakes', 'category': 'reptile/amphibian'},
    {'name': 'toad', 'plural': 'toads', 'category': 'reptile/amphibian'},
    {'name': 'tortoise', 'plural': 'tortoises', 'category': 'reptile/amphibian'},
    {'name': 'turkey', 'plural': 'turkeys', 'category': 'avian'},
    {'name': 'turtle', 'plural': 'turtles', 'category': 'reptile/amphibian'}
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
    Animal.objects.using(db_alias).filter(species='bird').update(species_fk=Species.objects.using(db_alias).get(name__iexact='chicken'))

class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0028_animalspecies_speciescategory'),
    ]

    operations = [
        migrations.RunPython(create_species_and_categories, migrations.RunPython.noop)
    ]
