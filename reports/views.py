from django.db.models import Count, Exists, OuterRef, Subquery, Prefetch, F, Q, IntegerField
from django.db.models.functions import TruncDay
from rest_framework import viewsets
from rest_framework.response import Response
from animals.models import Animal
from hotline.models import ServiceRequest
from evac.models import DispatchTeam
from shelter.models import Shelter
import datetime
from django.utils import timezone

# Provides view for Person API calls.
class ReportViewSet(viewsets.ViewSet):

  def list(self, response):
    start_date = ServiceRequest.objects.all().annotate(date=TruncDay('timestamp')).values('date').earliest('date')['date']
    end_date = timezone.now()

    daily_report = []
    sr_worked_report = []
    delta = datetime.timedelta(days=1)

    while end_date >= start_date:
      service_requests = ServiceRequest.objects.filter(assignedrequest__timestamp__date=end_date).distinct()
      total_assigned = service_requests.count()
      sip_sr_worked = service_requests.filter(sip=True).count()
      utl_sr_worked = service_requests.filter(utl=True).count()
      teams = DispatchTeam.objects.filter(dispatch_date__date=end_date).distinct('name').count()

      daily_data = {
        'date': end_date.strftime('%m/%d/%Y'),
        'total': ServiceRequest.objects.filter(timestamp__date__lte=end_date).count(),
        'assigned': total_assigned,
        'new': ServiceRequest.objects.filter(timestamp__date=end_date).count()
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

    shelters = Shelter.objects.all().annotate(dogs=Count("animal", filter=Q(animal__species="dog", animal__status='SHELTERED')), cats=Count("animal", filter=Q(animal__species="cat", animal__status='SHELTERED')), horses=Count("animal", filter=Q(animal__species="horse", animal__status='SHELTERED')), other=Count("animal", filter=Q(animal__species="other", animal__status='SHELTERED')), total=Count("animal", filter=Q(animal__status='SHELTERED'))).values('name', 'dogs', 'cats', 'horses', 'other', 'total')
    animals_status = Animal.objects.exclude(status='CANCELED').values('species').annotate(reported=Count("id", filter=Q(status='REPORTED')), utl=Count("id", filter=Q(status='UNABLE TO LOCATE')), sheltered=Count("id", filter=Q(status='SHELTERED')), sip=Count("id", filter=Q(status='SHELTERED IN PLACE')), reunited=Count("id", filter=Q(status='REUNITED')), deceased=Count("id", filter=Q(status='DECEASED')), total=Count("id")).order_by()
    animals_ownership = Animal.objects.exclude(status='CANCELED').values('species').distinct().annotate(owned=Count("id", filter=Q(owners__isnull=False)), stray=Count("id", filter=Q(owners__isnull=True)), total=Count("id")).order_by()
    data = {'daily_report':daily_report, 'sr_worked_report':sr_worked_report, 'shelter_report':shelters, 'animal_status_report':animals_status, 'animal_owner_report':animals_ownership}
    return Response(data)
