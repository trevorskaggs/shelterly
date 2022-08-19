from django.db.models import Count, CharField, DateTimeField, Exists, OuterRef, Subquery, Prefetch, F, Q, IntegerField, Value
from django.db.models.functions import Cast, TruncDay
from rest_framework import viewsets
from operator import itemgetter
from rest_framework.response import Response
from animals.models import Animal
from hotline.models import ServiceRequest
from evac.models import DispatchTeam
from shelter.models import Shelter
import datetime
from actstream.models import Action
from django.utils import timezone

# Provides view for Person API calls.
class ReportViewSet(viewsets.ViewSet):

  def list(self, response):
    if ServiceRequest.objects.filter(incident__slug=self.request.GET.get('incident', '')).exists():
        start_date = ServiceRequest.objects.filter(incident__slug=self.request.GET.get('incident', '')).annotate(date=TruncDay('timestamp')).values('date').earliest('date')['date']
        end_date = timezone.now()

        daily_report = []
        sr_worked_report = []
        delta = datetime.timedelta(days=1)

        while end_date >= start_date:
          service_requests = ServiceRequest.objects.filter(incident__slug=self.request.GET.get('incident', ''), assignedrequest__timestamp__date=end_date).distinct()
          total_assigned = service_requests.count()
          sip_sr_worked = service_requests.filter(sip=True).count()
          utl_sr_worked = service_requests.filter(utl=True).count()
          teams = DispatchTeam.objects.filter(dispatch_date__date=end_date).distinct('name').count()

          daily_data = {
            'date': end_date.strftime('%m/%d/%Y'),
            'total': ServiceRequest.objects.filter(incident__slug=self.request.GET.get('incident', ''), timestamp__date__lte=end_date).count(),
            'assigned': total_assigned,
            'new': ServiceRequest.objects.filter(incident__slug=self.request.GET.get('incident', ''), timestamp__date=end_date).count()
          }
          daily_report.append(daily_data)
          sr_data = {
            'date': end_date.strftime('%m/%d/%Y'),
            'new_sr_worked': total_assigned - sip_sr_worked - utl_sr_worked,
            'sip_sr_worked': sip_sr_worked,
            'utl_sr_worked': utl_sr_worked,
            'total': total_assigned,
            'teams': teams,
            'sr_per_team': total_assigned / teams if teams > 0 else 0
          }
          sr_worked_report.append(sr_data)
          end_date -= delta

        shelters = Shelter.objects.filter(Q(incident__slug=self.request.GET.get('incident')) | Q(public=True)).annotate(
          alpacas=Count("animal", filter=Q(animal__species="alpaca", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          cats=Count("animal", filter=Q(animal__species="cat", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          cows=Count("animal", filter=Q(animal__species="cow", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          dogs=Count("animal", filter=Q(animal__species="dog", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          donkeys=Count("animal", filter=Q(animal__species="donkey", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          ducks=Count("animal", filter=Q(animal__species="duck", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          emus=Count("animal", filter=Q(animal__species="emu", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          goats=Count("animal", filter=Q(animal__species="goat", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          horses=Count("animal", filter=Q(animal__species="horse", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          llamas=Count("animal", filter=Q(animal__species="llama", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          other=Count("animal", filter=Q(animal__species="other", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          pigs=Count("animal", filter=Q(animal__species="pig", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          rabbits=Count("animal", filter=Q(animal__species="rabbit", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          sheep=Count("animal", filter=Q(animal__species="sheep", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          turkeys=Count("animal", filter=Q(animal__species="turkey", animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', ''))),
          total=Count("animal", filter=Q(animal__status='SHELTERED', animal__incident__slug=self.request.GET.get('incident', '')))).values('name', 'alpacas', 'cats', 'cows', 'dogs', 'donkeys', 'ducks', 'emus', 'goats', 'horses', 'llamas', 'other', 'pigs', 'rabbits', 'sheep', 'turkeys', 'total').order_by('name')
        animals_status = Animal.objects.filter(incident__slug=self.request.GET.get('incident', '')).exclude(status='CANCELED').values('species').annotate(reported=Count("id", filter=Q(status='REPORTED')), utl=Count("id", filter=Q(status='UNABLE TO LOCATE')), nfa=Count("id", filter=Q(status='UNABLE TO LOCATE - NFA')), sheltered=Count("id", filter=Q(status='SHELTERED')), sip=Count("id", filter=Q(status='SHELTERED IN PLACE')), reunited=Count("id", filter=Q(status='REUNITED')), deceased=Count("id", filter=Q(status='DECEASED')), total=Count("id")).order_by()
        animals_ownership = Animal.objects.filter(incident__slug=self.request.GET.get('incident', '')).exclude(status='CANCELED').values('species').annotate(owned=Count("id", filter=Q(owners__isnull=False)), stray=Count("id", filter=Q(owners__isnull=True)), total=Count("id")).order_by()
        animals_deceased = []
        for animal in list(Animal.objects.filter(incident__slug=self.request.GET.get('incident', ''), status='DECEASED').values('id', 'name', 'species', 'status', 'address', 'city', 'state', 'zip_code')):
            for action in Action.objects.filter(target_object_id=str(animal['id']), verb="changed animal status to DECEASED"):
                animal['date'] = action.timestamp
                animals_deceased.append(animal)
        data = {'daily_report':daily_report, 'sr_worked_report':sr_worked_report, 'shelter_report':shelters, 'animal_status_report':animals_status, 'animal_owner_report':animals_ownership, 'animal_deceased_report':sorted(animals_deceased, key=itemgetter('date'), reverse=True)}
        return Response(data)
    return Response({'daily_report':[], 'sr_worked_report':[], 'shelter_report':[], 'animal_status_report':[], 'animal_owner_report':[], 'animal_deceased_report':[]})
