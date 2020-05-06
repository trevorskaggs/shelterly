from animals.colors import CAT_COLOR_CHOICES, CAT_PATTERN_CHOICES, DOG_COLOR_CHOICES, DOG_PATTERN_CHOICES, UNKNOWN_CHOICE

SPECIES_CHOICES = (
    ('cat', "Cat"),
    ('dog', "Dog"),
    ('horse', 'Horse'),
    ('other', "Other"),
)

BREED_CHOICES = (
    UNKNOWN_CHOICE,
)

SEX_CHOICES = (
    ('M', "Male"),
    ('F', "Female"),
)

DOG_SIZE_CHOICES = (
    ('Small', "Small (< 20 lbs)"),
    ('Medium', "Medium (21 - 60 lbs)"),
    ('Large', "Large (61 - 110 lbs)"),
    ('Giant', "Giant (111+ lbs)"),
)

DOG_AGE_CHOICES = (
    ('Youth', "Youth (< 2 Years)"),
    ('Adult', "Adult (2 - 8 Years)"),
    ('Elerly', "Elderly (8+ Years)"),
)
CAT_SIZE_CHOICES = (
    ('Small', 'Small ( < 10 lbs)'),
    ('Full Size', 'Full Size (10+ lbs)'),
)
CAT_AGE_CHOICES = (
    ('Kitten', 'Kitten (<6 Months)'),
    ('Youth', 'Youth (6 Months - 2 Years)'),
    ('Adult', 'Adult (2 Years - 8 Years)'),
    ('Elderly', 'Elderly (8 Years - 15 Years)'),
    ('Geriatric', 'Geriatric (15+ years)'),
)

STATUS_CHOICES = (
    ('REPORTED', 'REPORTED'),
    ('SHELTERED', 'SHELTERED'),
    ('SHELTERED IN PLACE', 'SHELTERED IN PLACE'),
    ('NOT FOUND', 'NOT FOUND'),
    ('REST IN PEACE', 'REST IN PEACE'),
)

# Source: https://www.akc.org/dog-breeds/
DOG_BREEDS =  (
    UNKNOWN_CHOICE,
    ('Sporting Group', 'Sporting Group'),
    ('Working Group', 'Working Group'),
    ('Toy Group', 'Toy Group'),
    ('Herding Group', 'Hearding Group'),
    ('Hound Group', 'Hound Group'),
    ('Terrier Group', 'Terrier Group'),
)
# Source https://www.purina.com.au/cats/ownership/pedigree-cat-breed-groups
CAT_BREEDS = (
    UNKNOWN_CHOICE,
    ('British Shorthair', 'British Shorthair'),
    ('Burmese', 'Burmese'),
    ('Foreign Shorthair', 'Foreign Shorthair'),
    ('Oriental', 'Oriental'),
    ('Persian', 'Persian'),
    ('Semi-longhair', 'Semi-longhair'),
    ('Siamese', 'Siamese'),
)

ANIMAL_LOOKUP_DICT = {
    'dog':{
        'pcolor': DOG_COLOR_CHOICES,
        'scolor': DOG_COLOR_CHOICES,
        'markings': DOG_PATTERN_CHOICES,
        'size': DOG_SIZE_CHOICES,
        'age': DOG_AGE_CHOICES,
    },
    'cat':{
        'pcolor': CAT_COLOR_CHOICES,
        'scolor': CAT_COLOR_CHOICES,
        'markings': CAT_PATTERN_CHOICES,
        'size': CAT_SIZE_CHOICES,
        'age': CAT_AGE_CHOICES,
    },
}
ALL_AGE_CHOICES = DOG_AGE_CHOICES + CAT_AGE_CHOICES
ALL_SIZE_CHOICES = DOG_SIZE_CHOICES + CAT_SIZE_CHOICES
