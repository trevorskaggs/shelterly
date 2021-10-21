from django.db.models import Count, Exists, OuterRef, Subquery, Prefetch, F, Q, IntegerField
from django.db.models.functions import TruncDay
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response
from hotline.models import ServiceRequest
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

    while start_date <= end_date:
      data = {
        'date': start_date.strftime('%m/%d/%Y'),
        'total': service_requests.filter(timestamp__date__lte=start_date).count(),
        'assigned': service_requests.filter(assignedrequest__timestamp__date=start_date).count(),
        'new': service_requests.filter(timestamp__date=start_date).count()
      }
      daily_report.append(data)
      sr_data = {
        'date': start_date.strftime('%m/%d/%Y'),
        'new_sr_worked': service_requests.filter(timestamp__date__lte=start_date).count(),
        'sip_sr_worked': service_requests.filter(timestamp__date__lte=start_date).count(),
        'utl_sr_worked': service_requests.filter(timestamp__date__lte=start_date).count(),
        'total': service_requests.filter(timestamp__date__lte=start_date).count(),
        'teams': service_requests.filter(assignedrequest__timestamp__date=start_date).count(),
        'sr_per_team': service_requests.filter(timestamp__date=start_date).count()
      }
      sr_worked_report.append(sr_data)
      start_date += delta
    test = {'daily_report':daily_report, 'sr_worked_report':sr_worked_report}
    return Response(test)
