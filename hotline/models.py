from django.db import models
from location.models import Location
from people.models import Owner, Reporter

class ServiceRequest(Location):
    
    #keys
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, blank=True, null=True)
    reporter = models.ForeignKey(Reporter, on_delete=models.SET_NULL, blank=True, null=True)

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
        if self.owner:
            output.append('Owner: %s' % self.owner)
        if self.reporter:
            output.append(' Reporter: %s' % self.reporter)
        output.append('Animal Count: (%s)' % self.animal_set.all().count())
        return ','.join(output)

    @property
    def is_resolved(self):
        from animals.models import Animal
        return not Animal.objects.filter(request=self).filter(status__in=['REP', 'NFD']).exists()

    class Meta:
        ordering = []
