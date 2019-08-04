from django import forms
from animals.models import Animal
from location.forms import LocationForm

class AnimalForm(LocationForm):

    def __init__(self, species, *args, **kwargs):
        super(AnimalForm, self).__init__(*args, **kwargs)
        self.set_species_properties(species)

    def set_species_properties(self, species):
        self.fields['species'].initial = species
        self.fields['pcolor'].label = '%s Primary Color' % species.capitalize()
        self.fields['scolor'].label = '%s Secondary Color' % species.capitalize()
        self.fields['markings'].label = '%s Markings' % species.capitalize()

    class Meta:
        model = Animal
        exclude = ('latitude', 'longitude', 'request', 'owner')
        