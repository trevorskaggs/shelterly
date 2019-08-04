from django import forms
from location.forms import LocationForm
from hotline.models import EvacReq
from people.models import Owner, Reporter

class HotlineReporterForm(forms.ModelForm):

    class Meta:
        model = Reporter
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'work_phone', 'cell_phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]

class HotlineOwnerForm(forms.ModelForm):

    class Meta:
        model = Owner
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'work_phone', 'cell_phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]

class EvacRequestForm(LocationForm):

    def __init__(self, owner, *args, **kwargs):
        super(EvacRequestForm, self).__init__(*args, **kwargs)
        self.fields['owner'].widget = forms.HiddenInput()

    class Meta:
        model  = EvacReq
        fields = ['owner', 'directions', 'verbal_permission', 'outcome', 'key_provided', 'forced_entry']
