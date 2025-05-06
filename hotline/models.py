import sartopo_python
from datetime import datetime
from django.db import models, transaction
from django.conf import settings
from actstream import action
from django.core.mail import send_mass_mail
from django.template.loader import render_to_string
from django.contrib.sites.models import Site
from django.db.models.signals import post_save
from django.db.models import Sum
from django.contrib.auth import get_user_model
from rest_framework import response
from accounts.models import ShelterlyUser
from location.models import Location
from people.models import Person
from .managers import ServiceRequestQueryset
from incident.models import Incident, IncidentNotification

User = get_user_model()

STATUS_CHOICES = (
  ('open', 'Open'),
  ('assigned', 'Assigned'),
  ('closed', 'Closed'),
  ('canceled','Canceled')
)

class ServiceRequest(Location):

    id_for_incident = models.IntegerField(blank=True, null=True)
    
    #keys
    owners = models.ManyToManyField(Person, blank=True, related_name='request')
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name='reporter_service_request')
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, blank=False, default='open')
    priority = models.IntegerField(blank=False, default=2)

    #pre_fields
    timestamp = models.DateTimeField(auto_now_add=True)
    directions = models.TextField(blank=True)
    verbal_permission = models.BooleanField(default=False)
    key_provided = models.BooleanField(default=False)
    accessible = models.BooleanField(default=False)
    turn_around = models.BooleanField(default=False)
    sip = models.BooleanField(default=False)
    utl = models.BooleanField(default=False)
    caltopo_feature_id = models.CharField(blank=True, max_length=100)

    #post_fields
    followup_date = models.DateField(auto_now=False, auto_now_add=False, blank=True, null=True)

    def __str__(self):
        output = []
        output.append('Owner: %s' % self.owners.first() or 'Unknown')
        if self.reporter:
            output.append('Reporter: %s' % self.reporter)
        output.append('Animal Count: %s' % self.animal_set.all().count())
        return ', '.join(output)

    def update_status(self, user):
        from evac.models import AssignedRequest
        from animals.models import Animal
        status = 'closed'
        animals = Animal.objects.filter(status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'], request=self).exists()

        # Identify proper status based on DAs and Animals.
        if Animal.objects.filter(status='CANCELED', request=self).count() == self.animal_set.count():
            status = 'canceled'
        elif animals:
            if AssignedRequest.objects.filter(service_request=self, dispatch_assignment__end_time=None).exists():
                status = 'assigned'
            else:
                status = 'open'

            # Remove SR from any active DAs if all animals are canceled.
            if Animal.objects.filter(status__in=['CANCELED'], request=self).count() == self.animal_set.count():
                AssignedRequest.objects.filter(service_request=self, dispatch_assignment__end_time=None).delete()

            if self.status != status:
                status_verb = 'opened' if status == 'open' else status
                action.send(user, verb=f'{status_verb} service request', target=self)

        self.status = status
        self.save()

    def update_sip_utl(self):
        from animals.models import Animal
        sip = self.sip
        utl = self.utl

        # Update SIP/UTL identifiers.
        if not sip and Animal.objects.filter(status='SHELTERED IN PLACE', request=self).exists():
            sip = True
        elif not sip and Animal.objects.filter(status='UNABLE TO LOCATE', request=self).exists():
            utl = True
        self.sip = sip
        self.utl = utl

        self.save()

    def get_feature_title(self):
        from evac.models import EvacAssignment
        title = ''
        try:
            da = EvacAssignment.objects.get(end_time__isnull=True, service_requests=self)
            title += 'DA#%03d - ' % da.id_for_incident
        except:
            #No active DA
            pass
        title += "SR#%03d" % self.id_for_incident
        return title

    def get_feature_description(self):
        from animals.models import Species
        species_counts = {'REPORTED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}}
        all_species = self.animal_set.all().values_list('species__name', flat=True)
        for status in species_counts.keys():
            for species in all_species:
                a_count = self.animal_set.filter(species__name=species, status=status).aggregate(Sum('animal_count'))['animal_count__sum']
                if a_count:
                    species_counts[status][species] = a_count
        description = self.location_output.rsplit(',', 1)[0]  + " ("
        status_description = ''
        for status, status_key in [('Reported','REPORTED'), ('Reported (Evac Requested)','REPORTED (EVAC REQUESTED)'), ('Reported (SIP Requested)','REPORTED (SIP REQUESTED)'), ('SIP','SHELTERED IN PLACE'), ('UTL', 'UNABLE TO LOCATE')]:
            species_string = ''
            status_species = species_counts[status_key].keys()
            if status_species:
                for species in status_species:
                    species_count = species_counts[status_key][species]
                    sp = Species.objects.get(name=species)
                    sp_name = sp.name if species_count <= 1 else sp.plural_name
                    species_string += '%s %s, ' % (species_count, sp_name)
                status_description += '%s: %s, ' % (status, species_string[:-2])
        description += status_description[:-2]
        description += ")"
        description += "\nLast Updated: %s" % datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return description

    def get_marker_color(self):
        if self.animal_set.filter(status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)']).exists():
            return '#FF0000'
        elif self.animal_set.filter(status='SHELTERED IN PLACE').exists():
            return '#E1BF39'
        elif self.animal_set.filter(status='UNABLE TO LOCATE').exists():
            return '#0000FF'
        else:
            return '#000000'

    def get_marker_symbol(self):
        if self.animal_set.filter(status='REPORTED').exists():
            return 't:!'
        elif self.animal_set.filter(status='REPORTED (EVAC REQUESTED)').exists():
            return 't:ϟ'
        elif self.animal_set.filter(status__in=['REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE']).exists():
            return 'hut$circle'
        elif self.animal_set.filter(status='UNABLE TO LOCATE').exists():
            return 'clue'
        else:
            return 'c:target3'

    def get_feature_json(self):
        feature_json = {
          "geometry":{
              "coordinates":[
                str(self.longitude),
                str(self.latitude),
                0,
                0
              ],
              "type":"Point"
          },
          "id":self.id_for_incident,
          "type":"Feature",
          "properties":{
              "marker-symbol": self.get_marker_symbol(),
              "marker-color": self.get_marker_color(),
              "description": self.get_feature_description(),
              "title": self.get_feature_title(),
              "class": "Marker",
          }
        }
        return feature_json

    def push_json(self):
        sts = sartopo_python.SartopoSession('sartopo.com',
            self.incident.caltopo_map_id,
            id=settings.CALTOPO_ID,
            key=settings.CALTOPO_KEY,
            accountId=settings.CALTOPO_ACCOUNT_ID,
            sync=False,
        )
        folder_id = None
        # If the SR has already previously been pushed to Caltopo, it will have
        # a caltopo_feature_id, try to remove old object to create new one.
        if self.caltopo_feature_id:
            feat = sts.getFeature(id=self.caltopo_feature_id)
            if 'folderId' in feat['properties']:
                folder_id = feat['properties']['folderId']
            try:
                sts.delMarker(markerOrId=self.caltopo_feature_id)
            except:
                pass
        payload = {
            'title': self.get_feature_title(),
            'color': self.get_marker_color(),
            'symbol': self.get_marker_symbol(),
            'description': self.get_feature_description(),
            'folderId': folder_id
        }
        lon = self.longitude
        lat = self.latitude
        self.caltopo_feature_id = sts.addMarker(lon=lon, lat=lat, **payload)
        self.save()

    def save(self, *args, **kwargs):
        if not self.pk:
            total_srs = ServiceRequest.objects.select_for_update().filter(incident=self.incident).values_list('id', flat=True)
            with transaction.atomic():
                count = len(total_srs)
                self.id_for_incident = count + 1
                super(ServiceRequest, self).save(*args, **kwargs)
        else:
            super(ServiceRequest, self).save(*args, **kwargs)

    objects = ServiceRequestQueryset.as_manager()

    class Meta:
        ordering = ['-timestamp']

# Send email to hotline users on creation.
def email_on_creation(sender, instance, **kwargs):
    if kwargs["created"]:
        # Send email here.
        incident_notifications = IncidentNotification.objects.filter(incident=instance.incident)
        user_emails = [inc_not.user.email for inc_not in incident_notifications.all()]
        if len(user_emails) > 0:
            message = (
                "Service Request #" + str(instance.id_for_incident) + " Created for Shelterly",
                render_to_string(
                    'service_request_creation_email.txt',
                    {
                    'site': Site.objects.get_current(),
                    'id': instance.id_for_incident,
                    'organization': instance.incident.organization.slug,
                    'incident': instance.incident.slug,
                    'address': instance.location_output,
                    'sr_creation_date': instance.timestamp.strftime('%m/%d/%Y %H:%M:%S')
                    }
                ).strip(),
                "DoNotReply@shelterly.org",
                user_emails,
            )
            send_mass_mail((message,))

post_save.connect(email_on_creation, sender=ServiceRequest)


class ServiceRequestImage(models.Model):

    image = models.ImageField(upload_to='images/')
    name = models.CharField(max_length=25, blank=True)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.SET_NULL, null=True)


class ServiceRequestNote(models.Model):

    open = models.DateTimeField(auto_now=False, auto_now_add=True, blank=True, null=True)
    urgent = models.BooleanField(default=False)
    notes = models.TextField(max_length=2500, blank=True)
    author = models.ForeignKey(ShelterlyUser, null=True, on_delete=models.SET_NULL)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.SET_NULL, null=True, related_name='notes')

    class Meta:
        ordering = ['-open',]


class VisitNote(models.Model):

    date_completed = models.DateTimeField(blank=True, null=True)
    forced_entry = models.BooleanField(default=False)
    notes = models.TextField(max_length=2500, blank=True)

    class Meta:
        ordering = ['-date_completed',]
