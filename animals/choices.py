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
    ('S', "Small (< 20 lbs)"),
    ('M', "Medium (21 - 60 lbs)"),
    ('L', "Large (61 - 110 lbs)"),
    ('G', "Giant (111+ lbs)"),
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

# Source: https://www.akc.org/dog-breeds/
DOG_BREEDS = (
    ('Sporting Group', 'Sporting Group'),
    ('Working Group', 'Working Group'),
    ('Toy Group', 'Toy Group'),
    ('Herding Group', 'Hearding Group'),
    ('Hound Group', 'Hound Group'),
    ('Terrier Group', 'Terrier Group'),
)
# DOG_BREEDS = (
#     ('Affenpinscher', 'Affenpinscher'),
#     ('Afghan Hound', 'Afghan Hound'),
#     ('Afghan Shepherd', 'Afghan Shepherd'),
#     ('Aidi', 'Aidi'),
#     ('Airedale Terrier', 'Airedale Terrier'),
#     ('Akbash', 'Akbash'),
#     ('Akita', 'Akita'),
#     ('Alaskan Husky', 'Alaskan Husky'),
#     ('American Bulldog', 'American Bulldog')
#     ('American Cocker Spaniel', 'American Cocker Spaniel'),
#     ('American English Coonhound', 'American English Coonhound'),
#     ('American Foxhound', 'American Foxhound'),
#     ('American Hairless Terrier', 'American Hairless Terrier'),
#     ('American Pit Bull Terrier', 'American Pit Bull Terrier'),
#     ('American Staffordshire Terrier', 'American Staffordshire Terrier'),
#     ('American Water Spaniel', 'American Water Spaniel'),
#     ('Australian Cattle Dog', 'Australian Cattle Dog'),
#     ('Australian Kelpie', 'Australian Kelpie')
#     ('Australian Shepherd', 'Australian Shepherd'),
#     ('Australian Terrier', 'Australian Terrier'),
#     ('Armant', 'Armant'),
#     ('Basset Hound', 'Basset Hound'),
#     ('Beagle', 'Beagle'),
#     ('Bearded Collie', 'Bearded Collie'),
#     ('Belgian Shepherd Dog', 'Belgian Shepherd Dog'),
#     ('Bergamasco Shepherd', 'Bergamasco Shepherd'),
#     ('Black and Tan Coonhound', 'Black and Tan Coonhound'),
#     ('Mastiff', 'Mastiff'),
#     ('Black Norwegian Elkhound', 'Black Norwegian Elkhound'),
#     ('Black Russian Terrier', 'Black Russian Terrier'),
#     ('Bloodhound', 'Bloodhound'),
#     ('Bluetick Coonhound', 'Bluetick Coonhound'),
#     ('Border Collie', 'Border Collie'),
#     ('Border Terrier', 'Border Terrier'),
#     ('Boston Terrier', 'Boston Terrier'),
#     ('Boxer', 'Boxer'),
#     ('Boykin Spaniel', 'Boykin Spaniel'),
#     ('Brazilian Terrier', 'Brazilian Terrier'),
#     ('Bull Terrier', 'Bull Terrier'),
#     ('Bulldog', 'Bulldog'),
#     ('Bullmastiff', 'Bullmastiff'),
#     ('Catalan Sheepdog', 'Catalan Sheepdog'),
#     ('Chesapeake Bay Retriever', 'Chesapeake Bay Retriever'),
#     ('Chihuahua', 'Chihuahua'),
#     ('Chinese Crested Dog', 'Chinese Crested Dog'),
#     ('Chinese Imperial Dog', 'Chinese Imperial Dog'),
#     ('Chow Chow', 'Chow Chow'),
#     ('Collie', 'Collie'),
#     ('Dachshund', 'Dachshund'),
#     ('Dalmatian', 'Dalmatian'), 

# )
