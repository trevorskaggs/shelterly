from django.apps import AppConfig


class EvacConfig(AppConfig):
    name = 'evac'

    def ready(self):
        from actstream import registry
        registry.register(self.get_model('EvacAssignment'))
