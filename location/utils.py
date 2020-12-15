import json

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
    # Add reason for Person objects.
    reason = json.loads(obj.data)['reason'] if obj.data else ''
    reason_str = f' Reason: {reason}' if reason else ''
    if obj.action_object:
        name = obj.action_object.name or 'Unknown'
        return f'{obj.actor} {obj.verb} {name} {obj.timesince()} ago.{reason_str}'
    custom_verb = obj.verb.replace('ed ','ed this ')
    return f'{obj.actor} {custom_verb} {obj.timesince()} ago.{reason_str}'
