from django import forms

from shelter.models import Shelter, Building, Room, Cage

class ShelterForm(forms.ModelForm):

    class Meta:
        model = Shelter
        exclude = ['apartment']

class BuildingForm(forms.ModelForm):

    def __init__(self, shelter, *args, **kwargs):
        super(BuildingForm, self).__init__(*args, **kwargs)
        self.fields['shelter'].initial = shelter

    class Meta:
        model = Building
        fields = ['name', 'description', 'shelter']
        widgets = {'shelter': forms.HiddenInput()}

class RoomForm(forms.ModelForm):

    def __init__(self, building, *args, **kwargs):
        super(RoomForm, self).__init__(*args, **kwargs)
        self.fields['building'].initial = building

    class Meta:
        model = Room
        fields = ['name', 'description', 'building']
        widgets = {'building': forms.HiddenInput()}

class CageForm(forms.ModelForm):

    def __init__(self, room, *args, **kwargs):
        super(CageForm, self).__init__(*args, **kwargs)
        self.fields['room'].initial = room

    class Meta:
        model = Cage
        fields = ['name', 'description', 'room']
        widgets = {'room': forms.HiddenInput()}