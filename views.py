import os
import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect

from accounts.models import ShelterlyUser

def home(request):
    return render(request, "index.html")

def static_url(request, path):
    return redirect(settings.STATIC_URL + '%s' % path)