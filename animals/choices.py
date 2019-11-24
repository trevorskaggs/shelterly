from animals.colors import CAT_COLOR_CHOICES, CAT_PATTERN_CHOICES, DOG_COLOR_CHOICES, DOG_PATTERN_CHOICES

SPECIES_CHOICES = (
    ('cat', "Cat"),
    ('dog', "Dog"),
    ('horse', 'Horse'),
    ('oth', "Other"),
)

BREED_CHOICES = (
    ('unknown', "Unknown"),
)

SEX_CHOICES = (
    ('M', "Male"),
    ('F', "Female"),
)

SIZE_CHOICES = (
    ('S', "Small"),
    ('M', "Medium"),
    ('L', "Large"),
)

AGE_CHOICES = (
    ('Y', "Youth (< 2 Years)"),
    ('A', "Adult (2 - 8 Years)"),
    ('E', "Elderly (8+ Years)"),
)

ANIMAL_LOOKUP_DICT = {
    'dog':{
        'pcolor': DOG_COLOR_CHOICES,
        'scolor': DOG_COLOR_CHOICES,
        'markings': DOG_PATTERN_CHOICES,
    },
    'cat':{
        'pcolor': CAT_COLOR_CHOICES,
        'scolor': CAT_COLOR_CHOICES,
        'markings': CAT_PATTERN_CHOICES,
    },
}

STATUS_CHOICES = (
    ('REPORTED', 'REPORTED'),
    ('SHELTERED', 'SHELTERED'),
    ('SHELTERED IN PLACE', 'SHELTERED IN PLACE'),
    ('NOT FOUND', 'NOT FOUND'),
    ('REST IN PEACE', 'REST IN PEACE'),
)