import json

from django.http import HttpResponse
from django.shortcuts import render

from animals.models import Animal

def get_location_wkts(request, object_type, object_pk):
    output_json = {}
    if object_type == 'service_request':
        animals = Animal.objects.filter(request__pk=object_pk)
        for animal in animals:
            output_json[animal.pk] = animal.location_wkt
    return HttpResponse(json.dumps(output_json))