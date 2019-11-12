import re
from django import forms
from django.core.exceptions import ValidationError

NAME_REGEX = re.compile(r'[^A-Za-z]')
NAME_ERROR = "Invalid Input: Non-Letter Characters Found"

PHONE_REGEX = re.compile(r'\(?\d{3}\)?\-?\d{3}\-?\d{4}')
PHONE_FORM_ERROR = "Invalid Input: Use Following Formats (xxx)-xxx-xxxx OR xxxxxxxxxx "

ZIP_CODE_ERROR = "Invalid Input: Zip Code Error"

def NAME_VALIDATOR(name):
    if re.match(NAME_REGEX, name):
            raise forms.ValidationError(NAME_ERROR)

def PHONE_VALIDATOR(phone):
      if not re.match(PHONE_REGEX, phone):
            raise forms.ValidationError(PHONE_FORM_ERROR)

def ZIP_VALIDATOR(czip):
    if len(czip) != 5 or not czip.isdigit():
        raise forms.ValidatinError(ZIP_CODE_ERROR)