from django.db import models
from managers import ActionHistoryQueryset

class PersonQueryset(ActionHistoryQueryset):
    def with_images(self):
        return self.prefetch_related(
            models.Prefetch("personimage_set", to_attr="images")
        )