UNKNOWN_CHOICE = ('Unknown', 'Unknown')

## Source: https://en.wikipedia.org/wiki/Coat_(dog)#Colors
DOG_COLOR_CHOICES = (
    ('none', 'None'),
    ('black', 'Black'),
    ('blue', 'Blue'),
    ('brown', 'Brown'),
    ('tan', 'Tan'),
    ('brindle', 'Brindle'),
    ('cream', 'Cream/Taupe'),
    ('gold', 'Gold'),
    ('gray', 'Gray'),
    ('red', 'Red'),
    ('white', 'White'),
    ('yellow', 'Yellow'),
)

## Source: https://en.wikipedia.org/wiki/Coat_(dog)#Patterns
DOG_PATTERN_CHOICES = (
    ('none', 'None'),
    ('brindle', 'Brindle'),
    ('hairless', 'Hairless'),
    ('harlequin', 'Harlequin'),
    ('merle', 'Merle'),
    ('sable', 'Sable'),
    ('saddle', 'Saddle'),
    ('speckled', 'Speckled'),
    ('spotted', 'Spotted'),
    ('tuxedo', 'Tuxedo'),   
)

## Source: https://en.wikipedia.org/wiki/Cat_coat_genetics
CAT_COLOR_CHOICES = (
    ('black', 'Black'),
    ('caramel', 'Caramel'),
    ('chocolate', 'Chocolate'),
    ('cinnamon', 'Cinnamon'),
    ('grey', 'Grey'),
    ('orange', 'Orange'),
    ('white', 'White'),
)

## Source: https://en.wikipedia.org/wiki/Cat_coat_genetics
CAT_PATTERN_CHOICES = (
    ('none', 'None'),
    ('bengal', 'Bengal'),
    ('bicolor', 'Bicolor'),
    ('calico', 'Calico'),
    ('colorpoint', 'Colorpoint'),
    ('hairless', 'Hairless'),
    ('solid', 'Solid'),
    ('tabby', 'Tabby'),
    ('tortoiseshell', 'Tortoiseshell'),    
    
)

ALL_COLOR_CHOICES = DOG_COLOR_CHOICES + CAT_COLOR_CHOICES
ALL_PATTERN_CHOICES = DOG_PATTERN_CHOICES + CAT_PATTERN_CHOICES