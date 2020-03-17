import re
from django import forms
from people.models import Person, TeamMember
from form_utils import NAME_VALIDATOR, PHONE_VALIDATOR, ZIP_VALIDATOR

class PersonForm(forms.ModelForm):

    best_contact = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))
    first_name = forms.CharField(required=False, validators=[NAME_VALIDATOR])
    last_name = forms.CharField(required=False, validators=[NAME_VALIDATOR])
    home_phone = forms.CharField(required=False, validators=[PHONE_VALIDATOR])
    cell_phone = forms.CharField(required=False, validators=[PHONE_VALIDATOR])
    city = forms.CharField(required=False, validators=[NAME_VALIDATOR])
    zip_code = forms.CharField(required=False, validators=[ZIP_VALIDATOR])

    class Meta:
        model = Person
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]


class OwnerForm(forms.ModelForm):

    best_contact = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))
    first_name = forms.CharField(required=False, validators=[NAME_VALIDATOR])
    last_name = forms.CharField(required=False, validators=[NAME_VALIDATOR])
    home_phone = forms.CharField(required=False, validators=[PHONE_VALIDATOR])
    cell_phone = forms.CharField(required=False, validators=[PHONE_VALIDATOR])
    city = forms.CharField(required=False, validators=[NAME_VALIDATOR])
    zip_code = forms.CharField(required=False, validators=[ZIP_VALIDATOR])

    class Meta:
        model = Person
        fields = [ 'first_name', 'last_name', 'home_phone', \
           'phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]

class TeamMemberForm(forms.ModelForm):

    class Meta:
        model = TeamMember
        fields = ['first_name', 'last_name', 'cell_phone', 'agency_id']
