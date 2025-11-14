from django.shortcuts import render

from django.shortcuts import render
from .models import Pogoda

def pogoda_list(request):
    dane = Pogoda.objects.all()
    return render(request, "pogoda_list.html", {"dane": dane})
