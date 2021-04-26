from django.db import models

class EvacTeamMember(models.Model):

    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)
    phone = models.CharField(max_length=50, blank=False)
    agency_id = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return "%s, %s" % (self.last_name, self.first_name)

    class Meta:
        ordering = ['last_name', 'first_name']

class DispatchTeam(models.Model):

    name = models.CharField(max_length=50, blank=False)
    team_members = models.ManyToManyField(EvacTeamMember)
    dispatch_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-dispatch_date',]

class EvacAssignment(models.Model):
    from hotline.models import ServiceRequest

    team = models.ForeignKey(DispatchTeam, on_delete=models.SET_NULL, blank=True, null=True)
    service_requests = models.ManyToManyField(ServiceRequest, related_name='evacuation_assignments')
    # do we need this or can we get animals from SR?
    animals = models.ManyToManyField('animals.Animal', blank=True, related_name='evacuation_assignments')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-start_time',]
