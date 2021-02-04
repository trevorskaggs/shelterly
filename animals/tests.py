from rest_framework.test import APITestCase

from accounts.models import ShelterlyUser
from animals.models import Animal
from people.models import Person

class TestViews(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = ShelterlyUser.objects.create_user(username='test_user', email="test@test.com", password="test", is_active=True)
        cls.owner = Person.objects.create(first_name="Leroy", last_name="Jenkins")
        cls.animal = Animal.objects.create(name='bella')
        cls.animal.owners.set([cls.owner])

    def test_get_all_animals(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/animals/api/animal/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0].get('name'), 'bella')

    def test_get_animal(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/animals/api/animal/{self.animal.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('name'), 'bella')

    def test_search_animal(self):
        self.animal = Animal.objects.create(name='Einstein')
        self.animal.owners.set([self.owner])
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/animals/api/animal/{self.animal.pk}/', {'search':'Einstein'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('name'), 'Einstein')

    def test_search_animal_no_results(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/animals/api/animal/{self.animal.pk}/', {'search':'Einstein'})
        self.assertEqual(response.status_code, 404)

    def test_update_animal(self):
        self.client.force_authenticate(self.user)
        response = self.client.put(f'/animals/api/animal/{self.animal.pk}/', {'name':'Darwin'})
        self.assertEqual(response.status_code, 200)
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.name, 'Darwin')

    def test_create_animals(self):
        self.new_owner = Person.objects.create(first_name="New", last_name="Person")
        self.client.force_authenticate(self.user)
        response = self.client.post('/animals/api/animal/', {'owners':[self.new_owner.pk], 'name':'Phineas'})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Animal.objects.filter(owners=self.new_owner, name='Phineas', status="REPORTED").exists())
