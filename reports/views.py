from django.db.models import Count, Exists, OuterRef, Subquery, Prefetch, F, Q, IntegerField
from django.db.models.functions import TruncDay
from rest_framework import viewsets
from rest_framework.response import Response
from hotline.models import ServiceRequest
from evac.models import DispatchTeam
import datetime
from django.utils import timezone

# Provides view for Person API calls.
class ReportViewSet(viewsets.ViewSet):

  def list(self, response):
    service_requests = ServiceRequest.objects.all().order_by('-timestamp')
    start_date = service_requests.annotate(date=TruncDay('timestamp')).values('date').earliest('date')['date']
    end_date = timezone.now()

    daily_report = []
    sr_worked_report = []
    delta = datetime.timedelta(days=1)

    while end_date >= start_date:
      sip_sr_worked = service_requests.filter(assignedrequest__timestamp__date=end_date, sip=True).distinct().count()
      utl_sr_worked = service_requests.filter(assignedrequest__timestamp__date=end_date, utl=True).distinct().count()
      teams = DispatchTeam.objects.filter(dispatch_date__date=end_date).distinct('name').count()
      total_assigned = service_requests.filter(assignedrequest__timestamp__date=end_date).distinct().count(),

      data = {
        'date': end_date.strftime('%m/%d/%Y'),
        'total': service_requests.filter(timestamp__date__lte=end_date).count(),
        'assigned': total_assigned,
        'new': service_requests.filter(timestamp__date=end_date).count()
      }
      daily_report.append(data)
      sr_data = {
        'date': end_date.strftime('%m/%d/%Y'),
        'new_sr_worked': total_assigned[0] - sip_sr_worked - utl_sr_worked,
        'sip_sr_worked': sip_sr_worked,
        'utl_sr_worked': utl_sr_worked,
        'total': total_assigned,
        'teams': teams,
        'sr_per_team': total_assigned[0] / teams if teams > 0 else 0
      }
      sr_worked_report.append(sr_data)
      end_date -= delta
    test = {'daily_report':daily_report, 'sr_worked_report':sr_worked_report}
    return Response(test)
