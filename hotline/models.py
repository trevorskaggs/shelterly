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
    owner = models.ManyToManyField(Person, blank=True)
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name='reporter_service_request')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, blank=False, default='open')

    #pre_fields
    timestamp = models.DateTimeField(auto_now_add=True)
    directions = models.TextField(blank=True)
    verbal_permission = models.BooleanField(default=False)
    key_provided = models.BooleanField(default=False)
    accessible = models.BooleanField(default=False)
    turn_around = models.BooleanField(default=False)

    #post_fields
    followup_date = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

    def __str__(self):
        output = []
        output.append('Owner: %s' % self.owner or 'Unknown')
        if self.reporter:
            output.append('Reporter: %s' % self.reporter)
        output.append('Animal Count: %s' % self.animal_set.all().count())
        return ', '.join(output)

    class Meta:
        ordering = ['timestamp']

class VisitNote(models.Model):
    from evac.models import EvacAssignment

    date_completed = models.DateTimeField()
    evac_assignment = models.ForeignKey(EvacAssignment, on_delete=models.CASCADE)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE)
    forced_entry = models.BooleanField(default=False)
    notes = models.CharField(max_length=500, blank=True)
