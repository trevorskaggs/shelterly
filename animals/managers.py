from django.db import models
from managers import ActionHistoryQueryset


class AnimalQueryset(ActionHistoryQueryset):
    def with_images(self):
        return self.prefetch_related(
            models.Prefetch("animalimage_set", to_attr="images")
        )
