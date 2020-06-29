
# Takes an object with address fields and returns a combined string.
def build_full_address(obj):
    if obj:
        region = obj.city + ", " + obj.state + " " + obj.zip_code if obj.city else ""
        apartment = " " + obj.apartment + ", " if obj.apartment else ", " if region else ""
        if obj.address:
            return obj.address + apartment + region
    return ""
