from django.db.models import Count, CharField, DateTimeField, Exists, OuterRef, Subquery, Prefetch, F, Q, Min, Max, Sum, IntegerField, Value
from django.db.models.functions import Cast, Coalesce, TruncDay
from rest_framework import viewsets
from operator import itemgetter
from rest_framework.response import Response
from animals.models import Animal, SpeciesCategory
from hotline.models import ServiceRequest
from incident.models import Incident
from evac.models import DispatchTeam
from shelter.models import Shelter
from vet.models import VetRequest
import datetime
from actstream.models import Action
from django.utils import timezone

# Provides view for Person API calls.
class ReportViewSet(viewsets.ViewSet):

  def list(self, response):
      incident_slug = self.request.GET.get('incident', '')
      organization_slug = self.request.GET.get('organization', '')
      incident = Incident.objects.get(organization__slug=organization_slug, slug=incident_slug)
      animals = Animal.objects.select_related('incident').select_related('species').select_related('species__category').prefetch_related('owners').exclude(status='CANCELED').filter(incident=incident)

      animals_species_categories = [
        ('cat', 'Cats'),
        ('dog', 'Dogs'),
        ('avian', 'Avians'),
        ('reptile/amphibian', 'Reptiles/Amphibians'),
        ('fish', 'Fish'),
        ('small_mammals', 'Small Mammals'),
        ('equine', 'Equines'),
        ('ruminant', 'Ruminants'),
        ('camelid', 'Camelids'),
        ('swine', 'Swine'),
        ('other', 'Other')
      ]

      #Set Initial Daily Report States
      daily_report, sr_worked_report = [], []

      if ServiceRequest.objects.filter(incident=incident).exists():
          start_date = ServiceRequest.objects.select_related('incident').filter(incident=incident).annotate(date=TruncDay('timestamp')).values('date').earliest('date')['date']
          end_date = timezone.localtime(timezone.now())
          delta = datetime.timedelta(days=1)

          while end_date >= start_date:
              assigned_srs = ServiceRequest.objects.select_related('incident').select_related('assignedrequest').filter(incident=incident, assignedrequest__timestamp__date=end_date).distinct()

              # Daily Report
              total_srs = ServiceRequest.objects.select_related('incident').filter(incident=incident, timestamp__date__lte=end_date).count()
              total_assigned = assigned_srs.count()
              new_srs = ServiceRequest.objects.select_related('incident').filter(incident=incident, timestamp__date=end_date).count()

              #if total_assigned or new_srs:
              daily_data = {
                'date': end_date.strftime('%m/%d/%Y'),
                'total': total_srs,
                'assigned': total_assigned,
                'new': new_srs
              }
              daily_report.append(daily_data)

              # SR Worked Report
              new_srs_worked = assigned_srs.filter(sip=False).filter(utl=False).count()
              sip_srs_worked = assigned_srs.filter(sip=True).count()
              new_srs = ServiceRequest.objects.select_related('incident').filter(incident=incident, timestamp__date=end_date).count()
              utl_srs_worked = assigned_srs.filter(utl=True).count()
              teams = DispatchTeam.objects.filter(dispatch_date__date=end_date).distinct('name').count()

              #if new_srs_worked or sip_srs_worked or utl_srs_worked:
              sr_data = {
                'date': end_date.strftime('%m/%d/%Y'),
                'new_sr_worked': new_srs_worked,
                'sip_sr_worked': sip_srs_worked,
                'utl_sr_worked': utl_srs_worked,
                'total': total_assigned,
                'teams': teams,
                'sr_per_team': round(total_assigned / teams, 1) if teams > 0 else 0
              }
              sr_worked_report.append(sr_data)
              end_date -= delta

      #Intake Report
      shelter_intake_report = []
      intaken_animals = animals.filter(intake_date__isnull=False).annotate(date=TruncDay('intake_date'))
      if intaken_animals:
          start_date = intaken_animals.values('date').earliest('date')['date']
          end_date = intaken_animals.values('date').latest('date')['date']
          delta = datetime.timedelta(days=1)
          while end_date >= start_date:
              daily_intake_animals = intaken_animals.filter(intake_date__date=end_date)
              intake_data = {}
              intake_data['date'] = end_date.strftime('%m/%d/%Y')
              for asc, asc_label in animals_species_categories:
                  intake_data[asc.replace('/', '')] = daily_intake_animals.filter(species__category__name=asc).aggregate(Sum("animal_count"))['animal_count__sum'] or 0
              intake_data['total'] = daily_intake_animals.aggregate(Sum("animal_count"))['animal_count__sum'] or 0
              if any(intake_data.values()):
                  shelter_intake_report.append(intake_data)
              end_date -= delta

      #Shelter Report
      shelter_report = []
      shelters = Shelter.objects.select_related('animal__incident').prefetch_related('animal_set', 'animal_set__species').filter(animal__incident=incident)
      annotations = {}
      for asc, asc_label in animals_species_categories:
          annotations[asc.replace('/', '')] = Coalesce(
              Sum(
                "animal__animal_count",
                  filter=Q(animal__species__category__name=asc, animal__status='SHELTERED', animal__incident=incident)
              ),
              Value(0)
          )
      annotations['total']=Coalesce(Sum("animal__animal_count", filter=Q(animal__status='SHELTERED', animal__incident__slug=incident_slug)), Value(0))
      shelter_report = shelters.annotate(**annotations).values("name", *annotations.keys()).order_by("name")

      #Animal Status Report
      animal_status_report = []
      for row in list(animals.values('species__category__name').annotate(reported=Coalesce(Sum("animal_count", filter=Q(status='REPORTED')), 0), reported_evac=Coalesce(Sum("animal_count", filter=Q(status='REPORTED (EVAC REQUESTED)')), 0), reported_sip=Coalesce(Sum("animal_count", filter=Q(status='REPORTED (SIP REQUESTED)')), 0), utl=Coalesce(Sum("animal_count", filter=Q(status='UNABLE TO LOCATE')), 0), nfa=Coalesce(Sum("animal_count", filter=Q(status='NO FURTHER ACTION')), 0), sheltered=Coalesce(Sum("animal_count", filter=Q(status='SHELTERED')), 0), sip=Coalesce(Sum("animal_count", filter=Q(status='SHELTERED IN PLACE')), 0), reunited=Coalesce(Sum("animal_count", filter=Q(status='REUNITED')), 0), deceased=Coalesce(Sum("animal_count", filter=Q(status='DECEASED')), 0)).order_by('species__category__name')):
          row['last'] = False
          animal_status_report.append(row)
      animal_status_report.append({'species__category__name': 'total', 'reported':sum(v['reported'] for v in animal_status_report), 'reported_evac':sum(v['reported_evac'] for v in animal_status_report), 'reported_sip':sum(v['reported_sip'] for v in animal_status_report), 'utl':sum(v['utl'] for v in animal_status_report), 'nfa':sum(v['nfa'] for v in animal_status_report), 'sheltered':sum(v['sheltered'] for v in animal_status_report), 'sip':sum(v['sip'] for v in animal_status_report), 'reunited':sum(v['reunited'] for v in animal_status_report), 'deceased':sum(v['deceased'] for v in animal_status_report), 'last':True})

      #Animal Ownership Report
      animals_ownership = []
      for row in list(animals.values('species__category__name').annotate(owned=Coalesce(Sum("animal_count", filter=Q(owners__isnull=False)), 0), stray=Coalesce(Sum("animal_count", filter=Q(owners__isnull=True)), 0)).order_by('species__category__name')):
          row['last'] = False
          animals_ownership.append(row)
      animals_ownership.append({'species__category__name': 'total', 'owned':sum(v['owned'] for v in animals_ownership), 'stray':sum(v['stray'] for v in animals_ownership), 'last':True})

      #Deceased Animal Report
      animals_deceased = []
      for animal in list(animals.filter(status='DECEASED').values('id', 'id_for_incident', 'animal_count', 'name', 'species__category__name', 'status', 'address', 'city', 'state', 'zip_code')):
          for action in Action.objects.filter(target_object_id=str(animal['id']), verb="changed animal status to DECEASED"):
              animal['date'] = action.timestamp
          animals_deceased.append(animal)
      animals_deceased = sorted(animals_deceased, key=itemgetter('date'), reverse=True)

      #Duplicate SR Report
      duplicate_sr_report = []
      active_incident_srs = ServiceRequest.objects.filter(incident__slug=incident_slug).exclude(status='canceled')
      for dupe_sr in active_incident_srs.values('address', 'city', 'state', 'zip_code').order_by('address', 'city', 'state', 'zip_code').annotate(Count('pk')).filter(pk__count__gt=1):
          dupe_sr_ids = ', '.join([str(pk) for pk in active_incident_srs.filter(address=dupe_sr['address'], city=dupe_sr['city'], state=dupe_sr['state'], zip_code=dupe_sr['zip_code']).values_list('id_for_incident', flat=True)])
          if ServiceRequest.objects.filter(id__in=active_incident_srs.filter(address=dupe_sr['address'], city=dupe_sr['city'], state=dupe_sr['state'], zip_code=dupe_sr['zip_code']).values_list('id', flat=True), status__in=['closed', 'canceled']).count() != ServiceRequest.objects.filter(id__in=active_incident_srs.filter(address=dupe_sr['address'], city=dupe_sr['city'], state=dupe_sr['state'], zip_code=dupe_sr['zip_code']).values_list('id', flat=True)).count():
            duplicate_sr_report.append({
              'address': dupe_sr['address'],
              'city': dupe_sr['city'],
              'state': dupe_sr['state'],
              'zip_code': dupe_sr['zip_code'],
              'count': dupe_sr['pk__count'],
              'sr_ids': dupe_sr_ids
            })

      #Followup Date Report
      sr_followup_date_report = []
      followup_start_date = ServiceRequest.objects.filter(animal__status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE']).exclude(followup_date__isnull=True).exclude(status__in=['closed', 'canceled']).filter(incident__slug=incident_slug).annotate(date=TruncDay('followup_date')).values('date').earliest('date')['date']
      followup_end_date = ServiceRequest.objects.filter(animal__status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE']).exclude(followup_date__isnull=True).exclude(status__in=['closed', 'canceled']).filter(incident__slug=incident_slug).annotate(date=TruncDay('followup_date')).values('date').latest('date')['date']
      while followup_end_date >= followup_start_date:
          srs = ServiceRequest.objects.filter(animal__status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE']).filter(incident__slug=incident_slug, followup_date=followup_end_date).exclude(status__in=['closed', 'canceled']).distinct()
          total = srs.count()
          followup_data = {
            'date': followup_end_date.strftime('%m/%d/%Y'),
            'new': len(srs.filter(animal__status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)'])),
            'sip': len(srs.exclude(animal__status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)']).filter(animal__status__in=['SHELTERED IN PLACE'])),
            'utl': len(srs.exclude(animal__status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE']).filter(animal__status__in=['UNABLE TO LOCATE'])),
            'total': total,
          }
          sr_followup_date_report.insert(0, followup_data)
          followup_end_date -= delta

      #Animal Care Report
      animal_care_information_report = []
      evac_total, sip_total, shelt_total, vet_request_total = 0, 0, 0, 0
      for asc, asc_label in animals_species_categories:
          category_animals = Animal.objects.filter(incident__slug=incident_slug, species__category__name=asc)
          evacuated = category_animals.filter(request__isnull=False, intake_date__isnull=False).count()
          evac_total += evacuated
          sip = category_animals.filter(sip_date__isnull=False).count()
          sip_total += sip
          sheltered = category_animals.filter(intake_date__isnull=False).count()
          shelt_total += sheltered
          vet_requests = VetRequest.objects.filter(medical_record__patient__in=category_animals).count()
          vet_request_total += vet_requests
          animal_care_information_report.append({'species_category': asc_label, 'evacuated': evacuated, 'sip': sip, 'sheltered': sheltered, 'vet_requests': vet_requests})
      animal_care_information_report.append({'species_category': 'Total', 'evacuated': evac_total, 'sip': sip_total, 'sheltered': shelt_total, 'vet_requests': vet_request_total})

      data = {'daily_report':daily_report, 'sr_worked_report':sr_worked_report, 'shelter_report':shelter_report, 'shelter_intake_report': shelter_intake_report, 'animal_status_report':animal_status_report, 'animal_owner_report':animals_ownership, 'animal_deceased_report':animals_deceased, 'duplicate_sr_report':duplicate_sr_report, 'sr_followup_date_report':sr_followup_date_report, 'animal_care_information_report': animal_care_information_report}
      return Response(data)
      return Response({'daily_report':[], 'sr_worked_report':[], 'shelter_report':[], 'shelter_intake_report': [], 'animal_status_report':[], 'animal_owner_report':[], 'animal_deceased_report':[], 'duplicate_sr_report': [],'sr_followup_date_report':[], 'animal_care_information_report':[]})
