from django import forms
from animals.models import animal

class DogForm(forms.ModelForm):

    class Meta:
        model = animal
        exclude = ('latitude', 'longitude',)
