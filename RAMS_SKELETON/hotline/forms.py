from django import forms
from people.models import Owner
from animals.models import Animal

class HotlineOwnerForm(forms.ModelForm):

    class Meta:
        model = Owner
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'work_phone', 'cell_phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]

class DogForm(forms.ModelForm):

    class Meta:
        model = Animal
        labels = {
            "pcolor" : "Dog Primary Color",
            "scolor" : "Dog Secondary Color",
            "markings" : "Dog Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')

class CatForm(forms.ModelForm):

    class Meta:
        model = Animal
        labels = {
            "pcolor" : "Cat Primary Color",
            "scolor" : "Cat Secondary Color",
            "markings" : "Cat Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')

class OtherForm(forms.ModelForm):

    class Meta:
        model = Animal
        labels = {
            "pcolor" : "Primary Color",
            "scolor" : "Secondary Color",
            "markings" : "Markings",
        }

        exclude = ('latitude', 'longitude', 'request', 'owner')
