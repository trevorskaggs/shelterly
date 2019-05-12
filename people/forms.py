from django import forms
from people.models import Owner, TeamMember

class OwnerForm(forms.ModelForm):

    class Meta:
        model = Owner
        fields = [ 'first_name', 'last_name', 'home_phone', \
            'work_phone', 'cell_phone', 'best_contact', \
            'drivers_license', 'address', 'apartment', 'city', \
            'state', 'zip_code', ]

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