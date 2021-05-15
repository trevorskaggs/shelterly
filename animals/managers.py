from django.db import models
from managers import ActionHistoryQueryset
from ordered_model.models import OrderedModelQuerySet


class AnimalQueryset(ActionHistoryQueryset, OrderedModelQuerySet):
    def with_images(self):
        return self.prefetch_related(
            models.Prefetch("animalimage_set", to_attr="images")
        )
