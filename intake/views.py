from django.shortcuts import render, redirect

from animals.forms import AnimalForm
from hotline.models import ServiceRequest
from people.forms import PersonForm
from people.views import owner_detail
from people.models import Person

# Create your views here.