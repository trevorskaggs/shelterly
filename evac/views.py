from django.shortcuts import render

# Create your views here.
def evac_landing(request):
    return render(request, 'evac_landing.html', {})