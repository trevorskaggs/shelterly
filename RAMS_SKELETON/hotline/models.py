from django.db import models

# Create your models here.
class animal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    request_id = models.ForeignKey()
    shelter_id = models.ForeignKey()
    name = models.CharField(max_lenght=50, blank=True, null=True)
    #choice tupels
    SPECIES_CHOICES = (
        (val, "Label"),
    )
    BREED_CHOICES = (
        (val, "Label"),
    )
    SEX_CHOICES = (
        (M, "Male"),
        (F, "Female"),
    )
    PCOLOR_CHOICES = (
        (val, "Label"),
    )
    SCOLOR_CHOICES = (
        (val, "Label"),
    )
    MARKINGS_CHOICES = (
        (val, "Label"),
    )
    SIZE_CHOICES = (
        (L, "Large"),
        (M, "Medium"),
        (S, "Small"),
    )

    #choice fields
    species = models.CharField(max_lenght=50, choices=SPECIES_CHOICES, blank=True, null=True)
    breed = models.CharField(max_lenght=50, choices=BREED_CHOICES, blank=True, null=True)
    sex = models.CharField(max_lenght=1, choices=SEX_CHOICES, blank=True, null=True)
    pcolor = models.CharField(max_lenght=50, choices=PCOLOR_CHOICES, blank=True, null=True)
    scolor = models.CharField(max_lenght=50, choices=SCOLOR_CHOICES, blank=True, null=True)
    markings = models.CharField(max_lenght=50, choices=MARKINGS_CHOICES, blank=True, null=True)
    size = models.CharField(max_lenght=1, choices=SIZE_CHOICES, blank=True, null=True)

    aggressive = models.BooleanField(blank=True, null=True)
    confined = BooleanField(blank=True, null=True)
    fixed = models.BooleanField(blank=True, null=True)
    age = models.PositiveSmallIntegerField(blank=True, null=True)
    med_stats = models.TextField(blank=True, null=True)
    collar_info = models.TextField(blank=True, null=True)
    tag_info = models.TextField(blank=True, null=True)
    chipped = models.BooleanField(blank=True, null=True)
    chip_info = models.TextField(blank=True, null=True)
    address = models.CharField(max_lenght=50, blank=True, null=True)
    city = models.CharField(max_lenght=50, blank=True, null=True)
    state = models.CharField(max_lenght=50, blank=True, null=True)
    zip = models.PositiveSmallIntegerField(blank=True, null=True)
    latitude = DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    recovery_time = models.OneToOneField(recovery_time)
    intake_time = modles.OneToOneField()

    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
class person(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_lenght=50, blank=True, null=True)
    address = models.CharField(max_lenght=50, blank=True, null=True)
    city = models.CharField(max_lenght=50, blank=True, null=True)
    state = models.CharField(max_lenght=50, blank=True, null=True)
    zip = models.PositiveSmallIntegerField(blank=True, null=True)
    latitude = DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    home_phone = models.PositiveIntegerField(blank=True, null=True)
    work_phone = models.PositiveIntegerField(blank=True, null=True)
    cell_phone = models.PositiveIntegerField(blank=True, null=True)
    best_contact = models.TextField(blank=True, null=True)
    drivers_license = models.CharField(max_lenght=50, blank=True, null=True)

    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
class ser_req(models.Model):

    #completed before response
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    timestamp = models.DateTimeField(auto_now_add=True)
    reporter_id = models.ForeignKey(person)
    owner_id = models.ForeignKey(person)
    attendant_id = models.ForeignKey(person)
    city = models.CharField(max_lenght=50, blank=True, null=True)
    state = models.CharField(max_lenght=50, blank=True, null=True)
    zip = models.PositiveSmallIntegerField(blank=True, null=True)
    latitude = DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    last_seen = DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    attended_to = models.BooleanField(blank=True, null=True)
    directions = models.TextField(blank=True, null=True)
    verbal_permission = models.BooleanField(blank=True, null=True)

    #completed after response
    key_provided = models.BooleanField(blank=True, null=True)
    forced_entry = models.BooleanField(blank=True, null=True)
    outcome = models.TextField(blank=True, null=True)
    owner_notification_notes = models.TextField(blank=True, null=True)
    recovery_time = DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    owner_notification_tstamp = DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)





    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
