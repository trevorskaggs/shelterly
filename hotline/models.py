from django.db import models
from location.models import Location
from people.models import Person


STATUS_CHOICES = (
  ('open', 'Open'),
  ('assigned', 'Assigned'),
  ('closed', 'Closed'),
  ('canceled','Canceled')
)

class ServiceRequest(Location):
    
    #keys
    owners = models.ManyToManyField(Person, blank=True, related_name='request')
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name='reporter_service_request')
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

    def update_status(self):
        from evac.models import AssignedRequest, EvacAssignment
        from animals.models import Animal
        status = 'closed'
        animals = Animal.objects.filter(status__in=['REPORTED', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE'], request=self).exists()

        # Identify proper status based on DAs and Animals.
        if animals and AssignedRequest.objects.filter(service_request=self, dispatch_assignment__end_time=None).exists():
            status = 'assigned'
        elif animals:
            status = 'open'
        elif Animal.objects.filter(status='CANCELED', request=self).count() == self.animal_set.count():
          status = 'canceled'

        # Remove SR from any active DAs if all animals are sheltered, deceased, reuinted, or canceled.
        if Animal.objects.filter(status__in=['SHELTERED', 'DECEASED', 'REUNITED', 'CANCELED'], request=self).count() == self.animal_set.count():
          AssignedRequest.objects.filter(service_request=self, dispatch_assignment__end_time=None).delete()

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


    class Meta:
        ordering = ['-timestamp']

class VisitNote(models.Model):

    date_completed = models.DateTimeField(blank=True, null=True)
    forced_entry = models.BooleanField(default=False)
    notes = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ['-date_completed',]
