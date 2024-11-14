from django.db.models import Count, CharField, DateTimeField, Exists, OuterRef, Subquery, Prefetch, F, Q, IntegerField, Value
from django.db.models.functions import Cast, TruncDay
from rest_framework import viewsets
from operator import itemgetter
from rest_framework.response import Response
from animals.models import Animal, SpeciesCategory
from hotline.models import ServiceRequest
from evac.models import DispatchTeam
from shelter.models import Shelter
import datetime
from actstream.models import Action
from django.utils import timezone

# Provides view for Person API calls.
class ReportViewSet(viewsets.ViewSet):

  def list(self, response):
    incident_slug = self.request.GET.get('incident', '')
    if ServiceRequest.objects.filter(incident__slug=incident_slug).exists():
        start_date = ServiceRequest.objects.select_related('incident').filter(incident__slug=incident_slug).annotate(date=TruncDay('timestamp')).values('date').earliest('date')['date']
        end_date = timezone.now()

        daily_report = []
        sr_worked_report = []
        shelter_intake_report = []
        delta = datetime.timedelta(days=1)

        animals = Animal.objects.select_related('incident').select_related('species').select_related('species__category').prefetch_related('owners').exclude(status='CANCELED').filter(incident__slug=incident_slug).distinct()
        animal_categories = [sc.replace('/', '').replace(' ', '_') for sc in SpeciesCategory.objects.all().values_list('name', flat=True)]

        while end_date >= start_date:
          service_requests = ServiceRequest.objects.select_related('incident').select_related('assignedrequest').filter(incident__slug=incident_slug, assignedrequest__timestamp__date=end_date).distinct()
          total_assigned = service_requests.count()
          sip_sr_worked = service_requests.filter(sip=True).count()
          utl_sr_worked = service_requests.filter(utl=True).count()
          teams = DispatchTeam.objects.filter(dispatch_date__date=end_date).distinct('name').count()
          intake_animals = animals.filter(intake_date__date=end_date)

          daily_data = {
            'date': end_date.strftime('%m/%d/%Y'),
            'total': ServiceRequest.objects.select_related('incident').filter(incident__slug=incident_slug, timestamp__date__lte=end_date).count(),
            'assigned': total_assigned,
            'new': ServiceRequest.objects.select_related('incident').filter(incident__slug=incident_slug, timestamp__date=end_date).count()
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
          intake_data = {}
          intake_data['date'] = end_date.strftime('%m/%d/%Y')
          intake_total = 0
          for animal_category in animal_categories:
            intake_data[animal_category.replace('/', '')] = intake_animals.filter(species__category__name=animal_category).count()
          intake_data['total'] = intake_animals.count()
          shelter_intake_report.append(intake_data)

          end_date -= delta
        shelters = Shelter.objects.select_related('animal__incident').prefetch_related('animal_set', 'animal_set__species').filter(animal__incident__slug=self.request.GET.get('incident')).annotate(
          avians=Count("animal", filter=Q(animal__species__category__name="avian", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          cats=Count("animal", filter=Q(animal__species__category__name="cat", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          dogs=Count("animal", filter=Q(animal__species__category__name="dog", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          equines=Count("animal", filter=Q(animal__species__category__name="equine", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          reptiles=Count("animal", filter=Q(animal__species__category__name="reptile/amphibian", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          ruminants=Count("animal", filter=Q(animal__species__category__name="ruminant", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          small_mammals=Count("animal", filter=Q(animal__species__category__name="small mammal", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          others=Count("animal", filter=Q(animal__species__category__name="other", animal__status='SHELTERED', animal__incident__slug=incident_slug)),
          total=Count("animal", filter=Q(animal__status='SHELTERED', animal__incident__slug=incident_slug))).values('name', 'avians', 'cats', 'dogs', 'equines', 'reptiles', 'ruminants', 'small_mammals', 'others', 'total').order_by('name')
        # Turn queryset into list so we can append a total row to it.
        animals_status = []
        for row in list(animals.values('species__category__name').annotate(reported=Count("id", filter=Q(status='REPORTED'), distinct=True), reported_evac=Count("id", filter=Q(status='REPORTED (EVAC REQUESTED)'), distinct=True), reported_sip=Count("id", filter=Q(status='REPORTED (SIP REQUESTED)'), distinct=True), utl=Count("id", filter=Q(status='UNABLE TO LOCATE'), distinct=True), nfa=Count("id", filter=Q(status='NO FURTHER ACTION'), distinct=True), sheltered=Count("id", filter=Q(status='SHELTERED'), distinct=True), sip=Count("id", filter=Q(status='SHELTERED IN PLACE'), distinct=True), reunited=Count("id", filter=Q(status='REUNITED'), distinct=True), deceased=Count("id", filter=Q(status='DECEASED'), distinct=True)).order_by('species__category__name')):
            row['last'] = False
            animals_status.append(row)
        # Add total row
        animals_status.append({'species__category__name': 'total', 'reported':sum(v['reported'] for v in animals_status), 'reported_evac':sum(v['reported_evac'] for v in animals_status), 'reported_sip':sum(v['reported_sip'] for v in animals_status), 'utl':sum(v['utl'] for v in animals_status), 'nfa':sum(v['nfa'] for v in animals_status), 'sheltered':sum(v['sheltered'] for v in animals_status), 'sip':sum(v['sip'] for v in animals_status), 'reunited':sum(v['reunited'] for v in animals_status), 'deceased':sum(v['deceased'] for v in animals_status), 'last':True})

        # Turn queryset into list so we can append a total row to it.
        animals_ownership = []
        for row in list(animals.values('species__category__name').annotate(owned=Count("id", filter=Q(owners__isnull=False), distinct=True), stray=Count("id", filter=Q(owners__isnull=True), distinct=True)).order_by('species__category__name')):
            row['last'] = False
            animals_ownership.append(row)
        animals_ownership.append({'species__category__name': 'total', 'owned':sum(v['owned'] for v in animals_ownership), 'stray':sum(v['stray'] for v in animals_ownership), 'last':True})

        #Decease Animals Report
        animals_deceased = []
        for animal in list(animals.filter(status='DECEASED').values('id', 'name', 'species__category__name', 'status', 'address', 'city', 'state', 'zip_code')):
            for action in Action.objects.filter(target_object_id=str(animal['id']), verb="changed animal status to DECEASED"):
                animal['date'] = action.timestamp
                animals_deceased.append(animal)

        ## Duplicate SR Report
        duplicate_sr_report = []
        active_incident_srs = ServiceRequest.objects.filter(incident__slug=incident_slug).exclude(status='canceled')
        for dupe_sr in active_incident_srs.values('address', 'city', 'state', 'zip_code').order_by('address', 'city', 'state', 'zip_code').annotate(Count('pk')).filter(pk__count__gt=1):
            dupe_sr_ids = ', '.join([str(pk) for pk in active_incident_srs.filter(address=dupe_sr['address'], city=dupe_sr['city'], state=dupe_sr['state'], zip_code=dupe_sr['zip_code']).values_list('id_for_incident', flat=True)])
            duplicate_sr_report.append({
              'address': dupe_sr['address'],
              'city': dupe_sr['city'],
              'state': dupe_sr['state'],
              'zip_code': dupe_sr['zip_code'],
              'count': dupe_sr['pk__count'],
              'sr_ids': dupe_sr_ids
            })

        ## Small Animal Care Report
        animal_care_report = []
        incident_animals = Animal.objects.filter(incident__slug=incident_slug).exclude(status='canceled')
        species = incident_animals.values_list('species__category__name', flat=True)
        evacuated_animals = incident_animals.filter(request__isnull=False, intake_date__isnull=False)
        sip_animals = incident_animals.filter(request__isnull=False, status='SHELTERED IN PLACE')
        sheltered_animals = incident_animals.filter(intake_date__isnull=False)
        report_fields = {
            'Evacuated': evacuated_animals,
            'SIP': sip_animals,
            'Sheltered': sheltered_animals
        }
        for key in report_fields.keys():
            report_out = [key]
            animals = report_fields[key]
            for ac in animal_categories:
                report_out.append(animals.filter(species__category__name=ac).count())
            animal_care_report.append(report_out)

        data = {'daily_report':daily_report, 'sr_worked_report':sr_worked_report, 'shelter_report':shelters, 'shelter_intake_report': shelter_intake_report, 'animal_status_report':animals_status, 'animal_owner_report':animals_ownership, 'animal_deceased_report':sorted(animals_deceased, key=itemgetter('date'), reverse=True), 'duplicate_sr_report': duplicate_sr_report, 'animal_care_report': animal_care_report}
        return Response(data)
    return Response({'daily_report':[], 'sr_worked_report':[], 'shelter_report':[], 'shelter_intake_report': [], 'animal_status_report':[], 'animal_owner_report':[], 'animal_deceased_report':[], 'duplicate_sr_report': []})
