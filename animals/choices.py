from animals.colors import CAT_COLOR_CHOICES, DOG_COLOR_CHOICES, HORSE_COLOR_CHOICES, OTHER_COLOR_CHOICES

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
    ('senior', "Senior"),
)

CAT_SIZE_CHOICES = (
    ('small', 'Small ( < 10 lbs)'),
    ('large', 'Large (10+ lbs)'),
)
CAT_AGE_CHOICES = (
    ('kitten', 'Kitten'),
    ('youth', 'Youth'),
    ('adult', 'Adult'),
    ('senior', 'Senior'),
    ('geriatric', 'Geriatric'),
)

HORSE_SIZE_CHOICES = (
    ('mini', 'Mini'),
    ('pony', 'Pony'),
    ('standard', 'Standard'),
    ('draft', 'Draft'),
)
HORSE_AGE_CHOICES = (
    ('young', "Young"),
    ('adult', "Adult"),
    ('senior', "Senior"),
)

OTHER_SIZE_CHOICES = (
    ('small', 'Small'),
    ('medium', 'Medium'),
    ('large', 'Large'),
)
OTHER_AGE_CHOICES = (
    ('young', "Young"),
    ('adult', "Adult"),
    ('senior', "Senior"),
)

STATUS_CHOICES = (
    ('REPORTED', 'REPORTED'),
    ('REUNITED', 'REUNITED'),
    ('SHELTERED', 'SHELTERED'),
    ('SHELTERED IN PLACE', 'SHELTERED IN PLACE'),
    ('UNABLE TO LOCATE', 'UNABLE TO LOCATE'),
    ('UNABLE TO LOCATE FINAL', 'UNABLE TO LOCATE FINAL'),
    ('DECEASED', 'DECEASED'),
    ('CANCELED', 'CANCELED')
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
