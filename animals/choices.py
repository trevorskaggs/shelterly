from animals.colors import CAT_COLOR_CHOICES, DOG_COLOR_CHOICES, HORSE_COLOR_CHOICES, OTHER_COLOR_CHOICES, UNKNOWN_CHOICE

UNKNOWN_CHOICES = (
  ('unknown', 'Unknown'),
  ('yes', 'Yes'),
  ('no', 'No')
)

SPECIES_CHOICES = (
    ('cat', "Cat"),
    ('dog', "Dog"),
    ('horse', 'Horse'),
    ('other', "Other"),
)

SEX_CHOICES = (
    ('M', "Male"),
    ('F', "Female"),
)

DOG_SIZE_CHOICES = (
    ('small', "Small (< 20 lbs)"),
    ('medium', "Medium (21 - 60 lbs)"),
    ('large', "Large (61 - 110 lbs)"),
    ('giant', "Giant (111+ lbs)"),
)

DOG_AGE_CHOICES = (
    ('youth', "Youth"),
    ('adult', "Adult"),
    ('elderly', "Elderly"),
)

CAT_SIZE_CHOICES = (
    ('small', 'Small ( < 10 lbs)'),
    ('full', 'Full Size (10+ lbs)'),
)
CAT_AGE_CHOICES = (
    ('kitten', 'Kitten'),
    ('youth', 'Youth'),
    ('adult', 'Adult'),
    ('elderly', 'Elderly'),
    ('geriatric', 'Geriatric'),
)

HORSE_SIZE_CHOICES = (
    ('mini', 'Mini'),
    ('pony', 'Pony'),
    ('horse', 'Horse'),
    ('draft', 'Draft'),
)
HORSE_AGE_CHOICES = (
    ('young', "Young"),
    ('adult', "Adult"),
    ('elderly', "Elderly"),
)

OTHER_SIZE_CHOICES = (
    ('small', 'Small'),
    ('medium', 'Medium'),
    ('large', 'Large'),
)
OTHER_AGE_CHOICES = (
    ('young', "Young"),
    ('adult', "Adult"),
    ('elderly', "Elderly"),
)

STATUS_CHOICES = (
    ('REPORTED', 'REPORTED'),
    ('ASSIGNED', 'ASSIGNED'),
    ('SHELTERED', 'SHELTERED'),
    ('SHELTERED IN PLACE', 'SHELTERED IN PLACE'),
    ('NOT FOUND', 'NOT FOUND'),
    ('REST IN PEACE', 'REST IN PEACE'),
)

ANIMAL_LOOKUP_DICT = {
    'dog':{
        'pcolor': DOG_COLOR_CHOICES,
        'scolor': DOG_COLOR_CHOICES,
        'size': DOG_SIZE_CHOICES,
        'age': DOG_AGE_CHOICES,
    },
    'cat':{
        'pcolor': CAT_COLOR_CHOICES,
        'scolor': CAT_COLOR_CHOICES,
        'size': CAT_SIZE_CHOICES,
        'age': CAT_AGE_CHOICES,
    },
    'horse':{
        'pcolor': HORSE_COLOR_CHOICES,
        'scolor': HORSE_COLOR_CHOICES,
        'size': HORSE_SIZE_CHOICES,
        'age': HORSE_AGE_CHOICES,
    },
    'other':{
        'pcolor': OTHER_COLOR_CHOICES,
        'scolor': OTHER_COLOR_CHOICES,
        'size': OTHER_SIZE_CHOICES,
        'age': OTHER_AGE_CHOICES,
    },
}
ALL_AGE_CHOICES = DOG_AGE_CHOICES + CAT_AGE_CHOICES + HORSE_AGE_CHOICES + OTHER_AGE_CHOICES
ALL_SIZE_CHOICES = DOG_SIZE_CHOICES + CAT_SIZE_CHOICES + HORSE_SIZE_CHOICES + OTHER_SIZE_CHOICES
