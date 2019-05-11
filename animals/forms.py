from django import forms
from animals.models import Animal

class AnimalForm(forms.ModelForm):

    def save(self, owner=None):
        if owner:
            animal.owner = owner
            animal.save()

    def set_initial_location(self, location_object):
        for field_name, field_value in location_object.get_location_fields():
            try:
                self.fields[field_name].initial = field_value
            except:
                pass

    def set_species_properties(self, species):
        self.fields['species'].initial = species
        self.fields['pcolor'].label = '%s Primary Color' % species.capitalize()
        self.fields['scolor'].label = '%s Secondary Color' % species.capitalize()
        self.fields['markings'].label = '%s Markings' % species.capitalize()

    class Meta:
        model = Animal
        exclude = ('latitude', 'longitude', 'request', 'owner')

class DogForm(AnimalForm):

    def __init__(self, *args, **kwargs):
        super(DogForm, self).__init__(*args, **kwargs)
        self.set_species_properties('dog')


class CatForm(AnimalForm):

    def __init__(self, *args, **kwargs):
        super(CatForm, self).__init__(*args, **kwargs)
        self.set_species_properties('cat')

class OtherForm(AnimalForm):

    pass
