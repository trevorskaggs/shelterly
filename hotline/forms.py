from django import forms
from location.forms import LocationForm
from hotline.models import ServiceRequest
from people.models import Person


class ServiceRequestForm(LocationForm):

    def __init__(self, owner=None, *args, **kwargs):
        super(ServiceRequestForm, self).__init__(*args, **kwargs)
        if owner:
            self.set_initial_location(owner)
        self.fields['owner'].widget = forms.HiddenInput()

    class Meta:
        model  = ServiceRequest
        fields = ['owner', 'directions', 'verbal_permission', 'outcome', 'key_provided', 'forced_entry', 'address']
