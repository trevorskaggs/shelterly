from django.db import models
from actstream.models import Action


class ActionHistoryManager(models.Manager):
    def with_history(self):
        return self.prefetch_related(
            models.Prefetch("target_actions", Action.objects.prefetch_related("actor"))
        )
