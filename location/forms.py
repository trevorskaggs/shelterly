from django import forms

class LocationForm(forms.ModelForm):

    def set_initial_location(self, location_object):
        location_dict = location_object.get_location_dict()
        for field_key in location_dict.keys():
            try:
                self.fields[field_key].initial = location_dict[field_key]
            except:
                pass
