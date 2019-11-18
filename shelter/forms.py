from django import forms

from shelter.models import Shelter, Building, Room, Cage

class ShelterForm(forms.ModelForm):

    class Meta:
        model = Shelter
        fields = ['name', 'description',]

class BuildingForm(forms.ModelForm):

    class Meta:
        model = Building
        fields = ['name', 'description', 'shelter']
        widgets = {'shelter': forms.HiddenInput()}