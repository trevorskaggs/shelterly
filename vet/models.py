from django.contrib.auth import get_user_model
from django.db import models

from animals.models import Animal

User = get_user_model()

class PresentingComplaint(models.Model):

    name = models.CharField(max_length=200)

# Create your models here.
class VetRequest(models.Model):

    patient = models.ForeignKey(Animal, on_delete=models.DO_NOTHING)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    open = models.DateTimeField(auto_now=False, auto_now_add=True)
    assigned = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    closed = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    presenting_complaints = models.ManyToManyField(PresentingComplaint)
    concern = models.CharField(max_length=200)
    priority = models.CharField(max_length=25, choices=(('urgent', 'Urgent'),('when_available', 'When Available'),), default='urgent')
    diagnosis = models.CharField(max_length=200, blank=True, null=True)


class Treatment(models.Model):

    description = models.CharField(max_length=200)
    category = models.CharField(max_length=200)
    valid_units = models.CharField(max_length=200, blank=True, null=True)
    valid_routes = models.CharField(max_length=200, blank=True, null=True)


class TreatmentPlan(models.Model):

    vet_request = models.ForeignKey(VetRequest, on_delete=models.SET_NULL, null=True)
    start = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    end = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    treatment = models.ForeignKey(Treatment, on_delete=models.SET_NULL, null=True)
    frequency = models.IntegerField(blank=True)
    quantity = models.IntegerField(blank=True)
    unit = models.CharField(max_length=5, choices=(('ml', 'ml'),('cap', 'cap'),('tab', 'tab'),), default='ml')
    route = models.CharField(max_length=5, choices=(('IV', 'IV'),('SQ', 'SQ'),('PO', 'PO'),), default='IV')


class TreatmentRequest(models.Model):

    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    suggested_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    actual_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    treatment_plan = models.ForeignKey(TreatmentPlan, on_delete=models.DO_NOTHING, null=True)
