from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Q
from datetime import datetime

from animals.models import Animal
from vet.managers import MedicalRecordQueryset

User = get_user_model()

class PresentingComplaint(models.Model):

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)

class Diagnostic(models.Model):

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)

class Procedure(models.Model):

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)

class Diagnosis(models.Model):

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)

class ExamQuestion(models.Model):

    name = models.CharField(max_length=20, blank=True, null=True)
    default = models.CharField(max_length=20, blank=True, null=True)
    options = ArrayField(models.CharField(max_length=40))
    categories = ArrayField(models.CharField(max_length=20))
    allow_not_examined = models.BooleanField()
    open_notes = models.BooleanField()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('id',)


class MedicalRecord(models.Model):

    procedure_notes = models.CharField(max_length=300, blank=True, null=True)
    diagnostics_notes = models.CharField(max_length=300, blank=True, null=True)
    diagnosis = models.ManyToManyField(Diagnosis, blank=True)
    diagnosis_other = models.CharField(max_length=50, blank=True, null=True)
    diagnosis_notes = models.CharField(max_length=300, blank=True, null=True)
    medical_status = models.CharField(max_length=20, default='Healthy')
    medical_plan = models.TextField(blank=True, null=True)

    objects = MedicalRecordQueryset.as_manager()

class MedicalRecordImage(models.Model):

    image = models.ImageField(upload_to='images/')
    name = models.CharField(max_length=25, blank=True)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True)


class MedicalNote(models.Model):

    note = models.TextField(blank=True, null=True)
    open = models.DateTimeField(auto_now=False, auto_now_add=True)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ('-open',)


class VetRequest(models.Model):

    open = models.DateTimeField(auto_now=False, auto_now_add=False)
    status = models.CharField(max_length=20, default='Open')
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    caution = models.BooleanField(default=False)
    presenting_complaints = models.ManyToManyField(PresentingComplaint)
    complaints_other = models.CharField(max_length=50, blank=True, null=True)
    concern = models.CharField(max_length=200, blank=True, null=True)
    priority = models.CharField(max_length=25, choices=(('urgent', 'Urgent'),('when_available', 'When Available'),), default='urgent')
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ('-id',)


class Exam(models.Model):

    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    open = models.DateTimeField(auto_now=False, auto_now_add=True)
    confirm_sex_age = models.BooleanField(blank=True, null=True)
    confirm_chip = models.BooleanField(blank=True, null=True)
    temperature = models.CharField(max_length=20, blank=True, null=True)
    temperature_method = models.CharField(max_length=20, blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    weight_unit = models.CharField(max_length=10, blank=True, null=True)
    weight_estimated = models.BooleanField(default=False)
    pulse = models.FloatField(blank=True, null=True)
    respiratory_rate = models.CharField(max_length=20, blank=True, null=True)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True)
    vet_request = models.ForeignKey(VetRequest, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ('-id',)


class ExamAnswer(models.Model):

    exam = models.ForeignKey(Exam, on_delete=models.SET_NULL, null=True)
    question = models.ForeignKey(ExamQuestion, on_delete=models.SET_NULL, null=True)
    answer = models.CharField(max_length=40, blank=True, null=True)
    answer_notes = models.CharField(max_length=300, blank=True, null=True)

    class Meta:
        ordering = ('question__id',)


class DiagnosticResult(models.Model):

    open = models.DateTimeField(auto_now=False, auto_now_add=False)
    complete = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    other_name = models.CharField(max_length=50, blank=True, null=True)
    result = models.CharField(max_length=20, blank=True, null=True)
    notes = models.CharField(max_length=300, blank=True, null=True)
    diagnostic = models.ForeignKey(Diagnostic, on_delete=models.SET_NULL, null=True)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ('-id',)


class ProcedureResult(models.Model):

    open = models.DateTimeField(auto_now=False, auto_now_add=False)
    performer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    complete = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    other_name = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    procedure = models.ForeignKey(Procedure, on_delete=models.SET_NULL, null=True)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ('-id',)


class Treatment(models.Model):

    description = models.CharField(max_length=200)
    category = models.CharField(max_length=50)
    unit = models.CharField(max_length=20, blank=True, null=True)
    routes = ArrayField(models.CharField(max_length=8))
    controlled = models.BooleanField(default=False)

    class Meta:
        ordering = ('category', 'description',)


class TreatmentPlan(models.Model):

    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True)
    quantity = models.FloatField(blank=True, null=True)
    unit = models.CharField(max_length=20, blank=True, null=True)
    route = models.CharField(max_length=8, blank=True, null=True)
    frequency = models.IntegerField(blank=True, null=True)
    days = models.IntegerField(blank=True, null=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ('-id',)

class TreatmentRequest(models.Model):

    treatment_plan = models.ForeignKey(TreatmentPlan, on_delete=models.CASCADE, null=True)
    treatment = models.ForeignKey(Treatment, on_delete=models.SET_NULL, null=True)
    quantity = models.FloatField(blank=True)
    unit = models.CharField(max_length=5, blank=True, null=True)
    route = models.CharField(max_length=5, blank=True, null=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    suggested_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    actual_admin_time = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    not_administered = models.BooleanField(default=False)
    notes = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        ordering = ('id',)
