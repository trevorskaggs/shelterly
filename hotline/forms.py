from django import forms
from people.models import Owner
from .models import EvacReq

class HotlineOwnerForm(forms.ModelForm):

    class Meta:
        model = Owner
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'work_phone', 'cell_phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]

class EvacRequestForm(forms.ModelForm):

    class Meta:
        model  = EvacReq
        fields = ['owner', 'directions', 'verbal_permission']
