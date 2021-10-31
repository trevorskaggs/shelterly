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
      sip_sr_worked = service_requests.filter(sip=True).count()
      utl_sr_worked = service_requests.filter(utl=True).count()
      teams = DispatchTeam.objects.filter(dispatch_date__date=end_date).distinct('name').count()
      total_assigned = service_requests.count()

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
    data = {'daily_report':daily_report, 'sr_worked_report':sr_worked_report, 'shelter_report':shelters}
    return Response(data)
