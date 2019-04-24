from django import forms
from animals.models import animal

class DogForm(forms.ModelForm):

    class Meta:
        model = animal
        labels = {
            "pcolor" : "Dog Primary Color",
            "scolor" : "Dog Secondary Color",
            "markings" : "Dog Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')

class CatForm(forms.ModelForm):

    class Meta:
        model = animal
        labels = {
            "pcolor" : "Cat Primary Color",
            "scolor" : "Cat Secondary Color",
            "markings" : "Cat Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')

class OtherForm(forms.ModelForm):

    class Meta:
        model = animal
        labels = {
            "pcolor" : "Primary Color",
            "scolor" : "Secondary Color",
            "markings" : "Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')
