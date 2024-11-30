from django.db import models
from managers import ActionHistoryQueryset

class MedicalRecordQueryset(ActionHistoryQueryset):
    def with_images(self):
        return self.prefetch_related(
            models.Prefetch("medicalrecordimage_set", to_attr="images")
        )