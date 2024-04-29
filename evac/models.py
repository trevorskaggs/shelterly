from django.db import models

from hotline.models import ServiceRequest
from incident.models import Incident

class EvacTeamMember(models.Model):

    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)
    phone = models.CharField(max_length=50, blank=False)
    agency_id = models.CharField(max_length=50, blank=True)
    show = models.BooleanField(default=True)
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE)

    def __str__(self):
        agency = " (%s)" % (self.agency_id) if self.agency_id else ""
        return "%s, %s%s" % (self.last_name, self.first_name, agency)

    class Meta:
        ordering = ['last_name', 'first_name']

class DispatchTeam(models.Model):

    name = models.CharField(max_length=50)
    team_members = models.ManyToManyField(EvacTeamMember)
    dispatch_date = models.DateTimeField(auto_now_add=True)
    show = models.BooleanField(default=True)
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class EvacAssignment(models.Model):

    id_for_incident = models.IntegerField(blank=True, null=True)

    team = models.ForeignKey(DispatchTeam, on_delete=models.SET_NULL, blank=True, null=True)
    service_requests = models.ManyToManyField(ServiceRequest, through='AssignedRequest', related_name='evacuation_assignments')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE)
    closed = models.BooleanField(default=False)

    def get_geojson(self):
        geojson = {'features':[]}
        for service_request in self.service_requests.all():
            geojson['features'].append(service_request.get_feature_json())
        return geojson

    def save(self, *args, **kwargs):
        if not self.pk:
            self.id_for_incident = EvacAssignment.objects.filter(incident=self.incident).count() + 1
        super(EvacAssignment, self).save(*args, **kwargs)

    class Meta:
        ordering = ['-start_time',]

class AssignedRequest(models.Model):

    service_request = models.ForeignKey(ServiceRequest, null=True, on_delete=models.SET_NULL)
    dispatch_assignment = models.ForeignKey(EvacAssignment, null=True, on_delete=models.SET_NULL, related_name='assigned_requests')
    animals = models.JSONField()
    followup_date = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    owner_contact = models.ForeignKey('people.OwnerContact', null=True, on_delete=models.CASCADE, related_name='assigned_request')
    visit_note = models.ForeignKey('hotline.VisitNote', null=True, on_delete=models.CASCADE, related_name='assigned_request')
    timestamp = models.DateTimeField(null=True, blank=True)
