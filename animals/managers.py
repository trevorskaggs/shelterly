from django.db import models
from ..managers import ActionHistoryManager


class AnimalManager(ActionHistoryManager):
    def with_images(self):
        return self.prefetch_related(
            models.Prefetch("animalimage_set", to_attr="images")
        )
