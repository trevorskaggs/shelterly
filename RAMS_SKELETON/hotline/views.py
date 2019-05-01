from django.shortcuts import render

# Create your views here.
def hotline_landing(request):
    return render(request, 'hotline_landing.html')

def start_call(request):
    return render(request, 'start_call.html')
