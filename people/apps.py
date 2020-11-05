from django.apps import AppConfig

class PeopleConfig(AppConfig):
    name = 'people'

    def ready(self):
        from actstream import registry
        registry.register(self.get_model('Person'))
