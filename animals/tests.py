from rest_framework.test import APITestCase

from accounts.models import ShelterlyUser
from animals.models import Animal

class TestViews(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = ShelterlyUser.objects.create_user(username='test_user', email="test@test.com", password="test", is_active=True)
        cls.animal = Animal.objects.create(name='bella')
        Animal.objects.create(name='chester')
        Animal.objects.create(name='banana')


    def test_get_all_animals(self):
        self.client.force_login(self.user)
        response = self.client.get(f'/animals/api/animal/')
        self.assertEqual(len(response.json()), Animal.objects.count())

    def test_get_animal(self):
        self.client.force_login(self.user)
        response = self.client.get(f'/animals/api/animal/{self.animal.pk}/')
        self.assertEqual(response.json().get('name'), self.animal.name)
