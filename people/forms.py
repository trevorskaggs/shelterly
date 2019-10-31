import re
from django import forms
from people.models import Owner, TeamMember
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

NAME_REGEX = re.compile(r'[A-Za-z ]+')
NAME_ERROR = "Invalid Input: Non-Letter Characters Found"

PHONE_REGEX = re.compile(r'\(?\d{3}\)?\-?\d{3}\-?\d{4}')
PHONE_FORM_ERROR = "Invalid Input: Use Following Formats (xxx)-xxx-xxxx OR xxxxxxxxxx "



class OwnerForm(forms.ModelForm):

    best_contact = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 2, 'cols': 40}))
    
    class Meta:
        model = Owner
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'work_phone', 'cell_phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]


    def __init__(self, *args, **kwargs):
        super(OwnerForm, self).__init__(*args, **kwargs)
  
    def clean_first_name(self):
        fname = self.cleaned_data['first_name']
        if not re.match(NAME_REGEX, fname):
            raise ValidationError(NAME_ERROR)
        return fname
    
    def clean_last_name(self):
        lname = self.cleaned_data['last_name']
        if not re.match(NAME_REGEX, lname):
            raise ValidationError(NAME_ERROR)
        return lname
    
    def clean_home_phone(self):
        hphone = self.cleaned_data['home_phone']
        if not re.match(PHONE_REGEX, hphone):
            raise ValidationError(PHONE_FORM_ERROR)
        return hphone
    
    def clean_work_phone(self):
        wphone = self.cleaned_data['work_phone']
        if not re.match(PHONE_REGEX, wphone):
            raise ValidationError(PHONE_FORM_ERROR)
        return wphone
    
    def clean_cell_phone(self):
        cphone = self.cleaned_data['cell_phone']
        if not re.match(PHONE_REGEX, cphone):
            raise ValidationError(PHONE_FORM_ERROR)
        return cphone
    
    def clean_city(self):
        city = self.cleaned_data['city']
        if not re.match(NAME_REGEX, city):
            raise ValidationError(NAME_ERROR)
        return city

    def clean_zipc(self): 
        czip = self.cleaned_data['zip_code']
        if not czip.isdigit():
            raise ValidationError("Invalid Input: Non-Numerical Characters Found")
        return czip

class ReporterForm(forms.ModelForm):

    class Meta:
        model = Owner
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'work_phone', 'cell_phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]


class TeamMemberForm(forms.ModelForm):

    class Meta:
        model = TeamMember
        fields = ['first_name', 'last_name', 'cell_phone', 'agency_id']
