from django.db import models
from location.models import Location
from people.models import Person


STATUS_CHOICES = (
  ('open', 'Open'),
  ('assigned', 'Assigned'),
  ('closed', 'Closed')
)

class ServiceRequest(Location):
    
    #keys
    owner = models.OneToOneField(Person, on_delete=models.SET_NULL, blank=True, null=True)
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name='reported_servicerequest')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, blank=False, default='open')

    #pre_field
    timestamp = models.DateTimeField(auto_now_add=True)
    directions = models.TextField()
    verbal_permission = models.BooleanField(default=False)
    key_provided = models.BooleanField(default=False)
    accessible = models.BooleanField(default=False)
    turn_around = models.BooleanField(default=False)

    #post_field
    forced_entry = models.BooleanField(default=False)
    outcome = models.TextField(blank=True)
    owner_notification_notes = models.TextField(blank=True)
    recovery_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    owner_notification_tstamp = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

    def __str__(self):
        output = []
        output.append('Owner: %s' % self.owner or 'Unknown')
        if self.reporter:
            output.append('Reporter: %s' % self.reporter)
        output.append('Animal Count: %s' % self.animal_set.all().count())
        return ', '.join(output)
    
    @property
    def location_type(self):
        return 'service_request'

    class Meta:
        ordering = ['timestamp']
