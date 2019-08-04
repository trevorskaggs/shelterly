from django.db import models
from location.models import Location
from people.models import Owner, Reporter

# Create your models here.
class EvacReq(Location):
    #keys
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, blank=True, null=True)
    reporter = models.ForeignKey(Reporter, on_delete=models.SET_NULL, blank=True, null=True)
    #worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, blank=True, null=True)

    #pre_field
    timestamp = models.DateTimeField(auto_now_add=True)
    directions = models.TextField(blank=True, null=True)
    verbal_permission = models.BooleanField(blank=True, null=True)


    #post_field
    key_provided = models.BooleanField(blank=True, null=True)
    forced_entry = models.BooleanField(blank=True, null=True)
    outcome = models.TextField(blank=True, null=True)
    owner_notification_notes = models.TextField(blank=True, null=True)
    recovery_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    owner_notification_tstamp = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

    @property
    def is_resolved(self):
        from animals.models import Animal
        return not Animal.objects.filter(request=self).filter(status__in=['REP', 'NFD']).exists()

    class Meta:
        ordering = []
