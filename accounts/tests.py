from rest_framework.test import APITestCase

from accounts.models import ShelterlyUser

class TestAuthentication(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = ShelterlyUser.objects.create_user(username='test_user', email="test@test.com", password="test", is_active=True)

    def test_login(self):
        response = self.client.post('/login/', {'username':'test_user', 'password':'test'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('user').get('username'), self.user.username)
        self.assertTrue(response.json().get('token'))

    # def test_logout(self):
    #     response = self.client.post('/login/', {'username':'test_user', 'password':'test'})
    #     import ipdb; ipdb.set_trace()
    #     response = self.client.post('/logout/', {}, HTTP_AUTHORIZATION=f"Token: {response.json().get('token')}")
