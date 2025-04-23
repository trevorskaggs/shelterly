from rest_framework.test import APITestCase

from accounts.models import ShelterlyUser
from incident.models import Incident

class TestViews(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = ShelterlyUser.objects.create_user(email="test@test.com", cell_phone="5555555", password="test", is_active=True)
        cls.staff_user = ShelterlyUser.objects.create_user(email="staff_test@test.com", cell_phone="5555555", password="test", is_active=True, is_staff=True)
        cls.organization = Organization.objects.create(name='Test', slug='test', short_name='test')
        cls.incident = Incident.objects.create(organization=cls.organization, name='Bow Fire', slug='bow-fire', latitude=43.1569, longitude=-71.5529)

    def test_get_all_incidents(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/incident/api/incident/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    def test_get_incident(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/incident/api/incident/{self.incident.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('name'), 'Bow Fire')

    # def test_update_incident(self):
    #     self.client.force_authenticate(self.staff_user)
    #     response = self.client.put(f'/incident/api/incident/{self.incident.pk}/', {'name':'Bow Hooksett Fire', 'slug':'bow-hooksett-fire', 'latitude':self.incident.latitude, 'longitude':self.incident.longitude})
    #     self.assertEqual(response.status_code, 200)
    #     self.incident.refresh_from_db()
    #     self.assertEqual(self.incident.name, 'Bow Hooksett Fire')
