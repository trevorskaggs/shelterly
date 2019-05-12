from django.shortcuts import render
from people.models import TeamMember

# Create your views here.
def evac_landing(request):
    return render(request, 'evac_landing.html', {})