from django import forms
from animals.models import Animal
from animals.colors import ANIMAL_COLOR_DICT
from location.forms import LocationForm

class AnimalForm(LocationForm):

    collar_info = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))
    behavior_notes = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))
    chip_info = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))
    diet_notes =forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))
    med_notes = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))

    def __init__(self, species, owner=None, *args, **kwargs):
        super(AnimalForm, self).__init__(*args, **kwargs)
        self.set_species_properties(species)
        if owner:
            self.self.set_initial_location(owner)

    def set_species_properties(self, species):
        self.fields['species'].initial = species
        self.fields['pcolor'].label = '%s Primary Color' % species.capitalize()
        self.fields['pcolor'].choices = ANIMAL_COLOR_DICT[species]['pcolor']
        self.fields['scolor'].label = '%s Secondary Color' % species.capitalize()
        self.fields['scolor'].choices = ANIMAL_COLOR_DICT[species]['scolor']
        self.fields['markings'].label = '%s Markings' % species.capitalize()
        self.fields['markings'].choices = ANIMAL_COLOR_DICT[species]['markings']

    def save(self, owner=None):
        animal = super(AnimalForm, self).save()
        if owner:
            animal.owner = owner
            animal.save()

    class Meta:
        model = Animal
        exclude = ('latitude', 'longitude', 'request', 'owner')
        