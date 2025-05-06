
# Takes an object with address fields and returns a combined string.
def build_full_address(obj):
    if obj:
        city = obj.city + ", " if obj.city else ""
        region = city + obj.state + " " + obj.zip_code if obj.state else ""
        apartment = ", Apt " + obj.apartment + ", " if obj.apartment else ", " if region else ""
        if obj.address:
            return obj.address + apartment + region
    return ""

# Takes an action object and returns a combined string.
def build_action_string(obj):
    # In case we need to restore reason for frontend History.
    # reason = json.loads(obj.data).get('reason', '') if obj.data else ''
    # reason_str = f' Reason: {reason}' if reason else ''

    if obj.action_object:
        name = obj.action_object.name or 'Unknown'
        return f'{obj.actor} {obj.verb} {name} {obj.timesince()} ago.'
    custom_verb = obj.verb.replace('ed ','ed this ') if 'transfer' not in obj.verb else obj.verb
    return f'{obj.timestamp.strftime("%b-%d-%Y")}. {obj.actor} {custom_verb}. ({obj.timesince()} ago)'
