from django.contrib.auth import get_user_model
from django.db import models

from animals.models import Animal

User = get_user_model()

# Create your models here.
class VetRequest(models.Model):

    patient = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    open = models.DateTimeField(auto_now=False, auto_now_add=True)
    assigned = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    closed = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    concern = models.CharField(max_length=20)
    priority = models.CharField(max_length=25, choices=(('urgent', 'Urgent'),('when_available', 'When Available'),), default='urgent')


class TreatmentPlan(models.Model):

    patient = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    vet_request = models.ForeignKey(VetRequest, on_delete=models.SET_NULL, null=True)
    start = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    end = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)


class TreatmentRequest(models.Model):

    suggested_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    actual_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    treatment_plan = models.ForeignKey(TreatmentPlan, on_delete=models.SET_NULL, null=True)
    treatment_description = models.CharField(max_length=20)
    quantity = models.CharField(max_length=20)
    unit = models.CharField(max_length=25, choices=(('ml', 'ml'),('cap', 'cap'),('tab', 'tab'),), default='ml')
    route = models.CharField(max_length=25, choices=(('IV', 'IV'),('SQ', 'SQ'),('PO', 'PO'),), default='IV')
