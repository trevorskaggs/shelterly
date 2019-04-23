from django import forms
from animals.models import animal

class DogForm(forms.ModelForm):

    class Meta:
        model = animal
        labels = {
            "pcolor" : "Dog Primary Color",
            "scolor" : "Dog Primary Color",
            "markings" : "Dog Markings",
        }

        exclude = ('latitude', 'longitude', 'species', 'request', 'owner')
