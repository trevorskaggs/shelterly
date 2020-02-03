from django.db import models
from location.models import Location
from people.models import Person

class ServiceRequest(Location):
    
    #keys
    owner = models.OneToOneField(Person, on_delete=models.SET_NULL, blank=True, null=True)
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name='reported_servicerequest')

    #pre_field
    timestamp = models.DateTimeField(auto_now_add=True)
    directions = models.TextField(blank=True, null=True)
    verbal_permission = models.BooleanField(blank=True, null=True)
    key_provided = models.BooleanField(blank=True, null=True)

    #post_field
    forced_entry = models.BooleanField(blank=True, null=True)
    outcome = models.TextField(blank=True, null=True)
    owner_notification_notes = models.TextField(blank=True, null=True)
    recovery_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    owner_notification_tstamp = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

    def __str__(self):
        output = []
        output.append('Owner: %s' % self.owner or 'Unknown')
        if self.reporter:
            output.append('Reporter: %s' % self.reporter)
        output.append('Animal Count: %s' % self.animal_count)
        return ', '.join(output)

    @property
    def animal_count(self):
        return self.animal_set.all().count()
    
    @property
    def location_type(self):
        return 'service_request'

    class Meta:
        ordering = []
