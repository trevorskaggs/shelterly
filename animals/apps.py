from django.apps import AppConfig


class AnimalsConfig(AppConfig):
    name = 'animals'

    def ready(self):
        from actstream import registry
        registry.register(self.get_model('Animal'))
