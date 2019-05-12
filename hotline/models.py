from django.db import models
from people.models import Owner, Reporter

# Create your models here.
class EvacReq(models.Model):
    #keys
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, blank=True, null=True)
    reporter = models.ForeignKey(Reporter, on_delete=models.SET_NULL, blank=True, null=True)
    #worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, blank=True, null=True)

    #pre_field
    timestamp = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    attended_to = models.BooleanField(blank=True, null=True)
    directions = models.TextField(blank=True, null=True)
    verbal_permission = models.BooleanField(blank=True, null=True)

    #address
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    zip_code = models.PositiveSmallIntegerField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    #post_field
    key_provided = models.BooleanField(blank=True, null=True)
    forced_entry = models.BooleanField(blank=True, null=True)
    outcome = models.TextField(blank=True, null=True)
    owner_notification_notes = models.TextField(blank=True, null=True)
    recovery_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    owner_notification_tstamp = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
