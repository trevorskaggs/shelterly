import os
import settings
from django.http import JsonResponse
from django.shortcuts import render, redirect

from accounts.models import ShelterlyUser

def home(request):
    return render(request, "index.html")

def activate_incident(request):
    if request.user.is_superuser:
        #Get User File from S3 and Kickoff Script to Create All Users
        start_users = ShelterlyUser.objects.all().count()
        os.system("aws s3 cp s3://shelterly-client-data/%s-users.csv /tmp/users.csv" % os.environ.get('ORGANIZATION'))
        os.system("python scripts/import_users.py /tmp/users.csv")
        end_users = ShelterlyUser.objects.all().count()
        added_users = end_users - start_users
        return JsonResponse({'user_count': added_users})

def static_url(request, path):
    return redirect(settings.STATIC_URL + '%s' % path)