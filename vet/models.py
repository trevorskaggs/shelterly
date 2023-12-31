from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Q
from datetime import datetime

from animals.models import Animal

User = get_user_model()

class PresentingComplaint(models.Model):

    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)

class Diagnosis(models.Model):

    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)

class ExamQuestion(models.Model):

    name = models.CharField(max_length=20, blank=True, null=True)
    options = ArrayField(models.CharField(max_length=40))
    categories = ArrayField(models.CharField(max_length=20))
    allow_not_examined = models.BooleanField()
    open_notes = models.BooleanField()

    def __str__(self):
        return self.name

class Exam(models.Model):

    open = models.DateTimeField(auto_now=False, auto_now_add=True)
    confirm_sex_age = models.BooleanField(blank=True, null=True)
    confirm_chip = models.BooleanField(blank=True, null=True)
    temperature = models.CharField(max_length=20, blank=True, null=True)
    temperature_method = models.CharField(max_length=20, blank=True, null=True)
    weight = models.IntegerField(blank=True, null=True)
    weight_unit = models.CharField(max_length=10, blank=True, null=True)


class ExamAnswer(models.Model):

    exam = models.ForeignKey(Exam, on_delete=models.SET_NULL, null=True)
    question = models.ForeignKey(ExamQuestion, on_delete=models.SET_NULL, null=True)
    answer = models.CharField(max_length=40, blank=True, null=True)
    answer_notes = models.CharField(max_length=300, blank=True, null=True)


class VetRequest(models.Model):

    patient = models.ForeignKey(Animal, on_delete=models.DO_NOTHING)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    open = models.DateTimeField(auto_now=False, auto_now_add=True)
    assigned = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    closed = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    presenting_complaints = models.ManyToManyField(PresentingComplaint)
    concern = models.CharField(max_length=200, blank=True, null=True)
    priority = models.CharField(max_length=25, choices=(('urgent', 'Urgent'),('when_available', 'When Available'),), default='urgent')
    exam = models.ForeignKey(Exam, on_delete=models.SET_NULL, null=True)
    diagnosis = models.ManyToManyField(Diagnosis, blank=True)
    diagnosis_other = models.CharField(max_length=200, blank=True, null=True)
    diagnosis_notes = models.CharField(max_length=300, blank=True, null=True)
    status = models.CharField(max_length=20, default='Open')

    def check_closed(self):
        # Mark VetRequest as closed if there is at least one TreatmentPlan and all TRs are completed.
        if not self.closed and self.treatmentplan_set.all() and TreatmentRequest.objects.filter(treatment_plan__vet_request=self).filter(Q(actual_admin_time__isnull=True) | Q(not_administered=False)).exists():
            self.closed = datetime.now()
            self.status = 'Closed'
            self.save()

    class Meta:
        ordering = ('-id',)


class Treatment(models.Model):

    description = models.CharField(max_length=200)
    category = models.CharField(max_length=200)
    valid_units = models.CharField(max_length=200, blank=True, null=True)
    valid_routes = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        ordering = ('description',)


class TreatmentPlan(models.Model):

    vet_request = models.ForeignKey(VetRequest, on_delete=models.SET_NULL, null=True)
    start = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    end = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    treatment = models.ForeignKey(Treatment, on_delete=models.SET_NULL, null=True)
    frequency = models.IntegerField(blank=True)
    quantity = models.FloatField(blank=True)
    unit = models.CharField(max_length=5, choices=(('ml', 'ml'),('cap', 'cap'),('tab', 'tab'),), default='ml')
    route = models.CharField(max_length=5, choices=(('IV', 'IV'),('SQ', 'SQ'),('PO', 'PO'),), default='IV')
    status = models.CharField(max_length=20, default='Open')

    class Meta:
        ordering = ('id',)


class TreatmentRequest(models.Model):

    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    suggested_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    actual_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    treatment_plan = models.ForeignKey(TreatmentPlan, on_delete=models.SET_NULL, null=True)
    not_administered = models.BooleanField(default=False)

    class Meta:
        ordering = ('id',)
