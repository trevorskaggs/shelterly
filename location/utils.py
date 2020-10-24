
# Takes an object with address fields and returns a combined string.
def build_full_address(obj):
    if obj:
        region = obj.city + ", " + obj.state + " " + obj.zip_code if obj.city else ""
        apartment = " " + obj.apartment + ", " if obj.apartment else ", " if region else ""
        if obj.address:
            return obj.address + apartment + region
    return ""

# Takes an action object and returns a combined string.
def build_action_string(obj):
    custom_verb = obj.verb.replace('ed ','ed this ')
    return f'{obj.actor} {custom_verb} {obj.timesince()} ago'
