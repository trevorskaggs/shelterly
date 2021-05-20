from django.db import models
from actstream.models import Action


class ActionHistoryQueryset(models.QuerySet):
    def with_history(self):
        return self.prefetch_related(
            models.Prefetch("target_actions", Action.objects.prefetch_related("actor", "target", "action_object"))
        )
