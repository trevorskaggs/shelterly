from django.db import models
from actstream import action
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.sites.models import Site
from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from location.models import Location
from people.models import Person
from .managers import ServiceRequestQueryset
from incident.models import Incident

User = get_user_model()

STATUS_CHOICES = (
  ('open', 'Open'),
  ('assigned', 'Assigned'),
  ('closed', 'Closed'),
  ('canceled','Canceled')
)

def test_incident():
    return Incident.objects.get(name='Test').id

class ServiceRequest(Location):
    
    #keys
    owners = models.ManyToManyField(Person, blank=True, related_name='request')
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name='reporter_service_request')
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, default=test_incident)
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

    #post_fields
    followup_date = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

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
        if animals and AssignedRequest.objects.filter(service_request=self, dispatch_assignment__end_time=None).exists():
            status = 'assigned'
        elif Animal.objects.filter(status='CANCELED', request=self).count() == self.animal_set.count():
            status = 'canceled'
        elif animals:
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

    def get_feature_json(self):
        species_counts = {'REPORTED':{}, 'REPORTED (EVAC REQUESTED)':{}, 'REPORTED (SIP REQUESTED)':{}, 'SHELTERED IN PLACE':{}, 'UNABLE TO LOCATE':{}}
        for animal in self.animal_set.filter(status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE']):
            species_counts[animal.status][animal.species.name] = species_counts[animal.status].get(animal.species.name, 0) + 1
        description = self.location_output.rsplit(',', 1)[0]  + " ("
        count = 0
        for status in [('Reported','REPORTED'), ('Reported (Evac Requested)','REPORTED (EVAC REQUESTED)'), ('Reported (SIP Requested)','REPORTED (SIP REQUESTED)'), ('SIP','SHELTERED IN PLACE'), ('UTL', 'UNABLE TO LOCATE')]:
            if len(species_counts[status[1]].items()) > 0:
                if count > 0:
                    description += '; ' 
                count+= 1
                description += status[0] + ': ' + ', '.join(f'{value} {key}' + ('s' if value != 1 and animal.species.name != 'sheep' else '') for key, value in species_counts[status[1]].items()) #123 Ranch Rd, Napa CA (1 cat, 2 dogs)
        description += ")"
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
          "id":self.id,
          "type":"Feature",
          "properties":{
              "marker-symbol":"circle-n",
              "marker-color":"#FF0000",
              "description":description,
              "title":self.id,
              "class":"Marker",
          }
        }
        return feature_json

    objects = ServiceRequestQueryset.as_manager()

    class Meta:
        ordering = ['-timestamp']

# Send email to hotline users on creation.
def email_on_creation(sender, instance, **kwargs):
    if kwargs["created"]:
        # Send email here.
        send_mail(
            # title:
            "Service Request #" + str(instance.id) + " Created for Shelterly",
            # message:
            render_to_string(
                'service_request_creation_email.txt',
                {
                'site': Site.objects.get_current(),
                'id': instance.id,
                'incident': instance.incident.slug,
                'address': instance.location_output,
                }
            ).strip(),
            # from:
            "DoNotReply@shelterly.org",
            # to:
            User.objects.filter(perms__organization=instance.incident.organization, perms__email_notification=True).values_list('email', flat=True),
            fail_silently=False,
            html_message = render_to_string(
                'service_request_creation_email.html',
                {
                'site': Site.objects.get_current(),
                'id': instance.id,
                'incident': instance.incident.slug,
                'address': instance.location_output,
                }
            ).strip()
        )
post_save.connect(email_on_creation, sender=ServiceRequest)


class ServiceRequestImage(models.Model):

    image = models.ImageField(upload_to='images/')
    name = models.CharField(max_length=25, blank=True)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.SET_NULL, null=True)

class VisitNote(models.Model):

    date_completed = models.DateTimeField(blank=True, null=True)
    forced_entry = models.BooleanField(default=False)
    notes = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ['-date_completed',]
