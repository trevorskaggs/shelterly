from django import forms
from location.forms import LocationForm
from hotline.models import ServiceRequest
from people.models import Person


class ServiceRequestForm(LocationForm):

    directions = forms.CharField(required=False, widget=forms.Textarea(attrs={'rows': 3, 'cols': 40}))

    class Meta:
        model  = ServiceRequest
        fields = ['owner', 'directions', 'verbal_permission', 'outcome', 'key_provided', 'forced_entry', 'address']
        widgets = {'owner': forms.HiddenInput()}

class ServiceRequestSearchForm(forms.Form):

    search = forms.CharField(required=True)