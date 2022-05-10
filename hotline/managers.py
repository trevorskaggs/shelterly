from django.db import models
from managers import ActionHistoryQueryset

class ServiceRequestQueryset(ActionHistoryQueryset):
    def with_images(self):
        return self.prefetch_related(
            models.Prefetch("servicerequestimage_set", to_attr="images")
        )