from rest_framework.test import APITestCase

from accounts.models import ShelterlyUser
from animals.models import Animal
from hotline.models import ServiceRequest
from people.models import Person

class TestViews(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = ShelterlyUser.objects.create_user(username='test_user', email="test@test.com", password="test", is_active=True)
        cls.person = Person.objects.create(first_name="Jane", last_name="Doe", phone="123-456-7890")
        cls.service_request = ServiceRequest.objects.create(directions="Turn left")
        cls.service_request.owners.set([cls.person])
        cls.animal = Animal.objects.create(request=cls.service_request, name='bella')
        cls.animal.owners.set([cls.person])

    def test_get_all_service_requests(self):
        self.client.force_authenticate(self.user)        
        response = self.client.get('/hotline/api/servicerequests/')
        self.assertEqual(response.status_code, 200)

    def test_get_service_request(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/hotline/api/servicerequests/{self.service_request.pk}/')
        self.assertEqual(response.status_code, 200)

    def test_search_service_requests(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/hotline/api/servicerequests/{self.service_request.pk}/', {'search':'Jane'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('owner_objects')[0].get('first_name'), 'Jane')

    def test_search_service_requests_no_results(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/hotline/api/servicerequests/{self.service_request.pk}/', {'search':'John'})
        self.assertEqual(response.status_code, 404)

    def test_filter_open_service_requests(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(f'/hotline/api/servicerequests/{self.service_request.pk}/', {'status':'REPORTED'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get('id'), self.service_request.id)

    # def test_filter_closed_service_requests(self):
    #     self.client.force_authenticate(self.user)
    #     response = self.client.get(f'/hotline/api/servicerequests/{self.service_request.pk}/', {'status':'ASSIGNED'})
    #     self.assertEqual(response.status_code, 200)

    def test_create_service_request_owner(self):
        self.new_person = Person.objects.create(first_name="Leroy", last_name="Jenkins", latitude=0, longitude=0)
        self.new_animal = Animal.objects.create(name='Henry')
        self.new_animal.owners.set([self.new_person])
        self.client.force_authenticate(self.user)
        # Directions are currently a required field.
        response = self.client.post(f'/hotline/api/servicerequests/', {'owners':[self.new_person.pk], 'address':"123 Main St.", 'city':'Springfield', 'state':'MA', 'directions':"Turn left.", 'latitude':self.new_person.latitude, 'longitude':self.new_person.longitude}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ServiceRequest.objects.filter(owners=self.new_person.pk, address="123 Main St."))

    def test_create_service_request_no_owner(self):
        self.new_person = Person.objects.create(first_name="Leroy", last_name="Jenkins")
        self.new_animal = Animal.objects.create(name='Henry')
        self.new_animal.owners.set([self.new_person])
        self.client.force_authenticate(self.user)
        # Should directions be required field?
        response = self.client.post(f'/hotline/api/servicerequests/', {'reporter':self.person.pk, 'address':"123 Main St.", 'city':'Springfield', 'state':'MA', 'directions':"Turn left.", 'latitude':0, 'longitude':0}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ServiceRequest.objects.filter(reporter=self.person.pk, address='123 Main St.', directions="Turn left.").exists())
