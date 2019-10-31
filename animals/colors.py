## Source: https://en.wikipedia.org/wiki/Coat_(dog)#Colors
DOG_COLOR_CHOICES = (
    ('black', 'Black'),
    ('blue', 'Blue'),
    ('brown', 'Brown'),
    ('cream', 'Cream/Taupe'),
    ('gold', 'Gold'),
    ('gray', 'Gray'),
    ('red', 'Red'),
    ('white', 'White'),
    ('yellow', 'Yellow'),
)

## Source: https://en.wikipedia.org/wiki/Coat_(dog)#Patterns
DOG_PATTERN_CHOICES = (
    ('merle', 'Merle'),
    ('tuxedo', 'Tuxedo'),
    ('harlequin', 'Harlequin'),
    ('spotted', 'Spotted'),
    ('speckled', 'Speckled'),
    ('brindle', 'Brindle'),
    ('saddle', 'Saddle'),
    ('sable', 'Sable'),
    ('hairless', 'Hairless'),
)

## Source: https://en.wikipedia.org/wiki/Cat_coat_genetics
CAT_COLOR_CHOICES = (
    ('black', 'Black'),
    ('grey', 'Grey'),
    ('chocolate', 'Chocolate'),
    ('cinnamon', 'Cinnamon'),
    ('caramel', 'Caramel'),
    ('white', 'White'),
    ('orange', 'Orange'),
)

## Source: https://en.wikipedia.org/wiki/Cat_coat_genetics
CAT_PATTERN_CHOICES = (
    ('solid', 'Solid'),
    ('bicolor', 'Bicolor'),
    ('bengal', 'Bengal'),
    ('colorpoint', 'Colorpoint'),
    ('calico', 'Calico'),
    ('tortoiseshell', 'Tortoiseshell'),
    ('tabby', 'Tabby'),
    ('hairless', 'Hairless'),
)

ANIMAL_COLOR_DICT = {
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
