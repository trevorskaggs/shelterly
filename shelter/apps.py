from django.apps import AppConfig


class ShelterConfig(AppConfig):
    name = 'shelter'

    def ready(self):
        from actstream import registry
        registry.register(self.get_model('Shelter'))
        registry.register(self.get_model('Building'))
        registry.register(self.get_model('Room'))
