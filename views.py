import os
from django.shortcuts import render

def home(request):
    return render(request, "index.html")

def activate_incident(request):
    if request.user.is_superuser:
        #Get User File from S3 and Kickoff Script to Create All Users
        os.system("aws s3 cp s3://shelterly-client-data/%s-users.csv /tmp/users.csv" % os.environ.get('ORGANIZATION')
        os.system("python scripts/import_users.py /tmp/users.csv 0")