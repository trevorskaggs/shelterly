from django import forms
from animals.models import Animal

class AnimalForm(forms.ModelForm):

    def save(self, owner=None):
        animal = super(AnimalForm, self).save()
        import ipdb; ipdb.set_trace()
        if owner:
            animal.owner = owner
            animal.save()

    def set_initial_location(self, location_object):
        for field_name, field_value in location_object.get_location_fields():
            self.fields[field_name].initial = field_value


class DogForm(AnimalForm):

    def __init__(self, *args, **kwargs):
        super(DogForm, self).__init__(*args, **kwargs)
        self.initial['species'] = 'dog'

    class Meta:
        model = Animal
        labels = {
            "pcolor" : "Dog Primary Color",
            "scolor" : "Dog Secondary Color",
            "markings" : "Dog Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')

class CatForm(AnimalForm):

    def __init__(self, *args, **kwargs):
        super(CatForm, self).__init__(*args, **kwargs)
        self.initial['species'] = 'cat'

    class Meta:
        model = Animal
        labels = {
            "pcolor" : "Cat Primary Color",
            "scolor" : "Cat Secondary Color",
            "markings" : "Cat Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')

class OtherForm(AnimalForm):

    class Meta:
        model = Animal
        labels = {
            "pcolor" : "Primary Color",
            "scolor" : "Secondary Color",
            "markings" : "Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')
