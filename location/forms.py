from django import forms

class LocationForm(forms.ModelForm):

    def set_initial_location(self, location_object):
        for field_name, field_value in location_object.get_location_fields():
            try:
                self.fields[field_name].initial = field_value
            except:
                pass