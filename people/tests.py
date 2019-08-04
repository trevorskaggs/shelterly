from django.test import TestCase
from django.urls import reverse
from people.models import Person, Reporter, Owner, TeamMember
from people.forms import OwnerForm


# Model Test
class OwnerTest(TestCase):

    def create_owner(self, first_name='Guy', last_name='Fieri', \
        home_phone='18003587', work_phone='18003587', cell_phone='18003587', \
        best_contact='DDD', drivers_license='FLVRTWN'):
        return Owner.objects.create(first_name=first_name, last_name=last_name, \
            home_phone=home_phone, work_phone=work_phone, cell_phone=cell_phone, \
            best_contact=best_contact, drivers_license=drivers_license)
    
    def test_owner_creation(self):
        o = self.create_owner()
        self.assertTrue(isinstance(o, Owner))
        self.assertEqual(o.__str__(), o.first_name + ' ' + o.last_name)

# View Test
    def test_owner_list_view(self):
        o = self.create_owner()
        url = reverse('people:owner_list')
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertIn(o.first_name + ' ' + o.last_name, str(resp.content))
    
    def test_owner_detail_view(self):
        o = self.create_owner()
        #set url to pk to test 'get object'
        url = reverse('people:owner_detail', args=[o.pk])
        resp = self.client.get(url)
        #set url to false pk to test 404
        f_url = reverse('people:owner_detail', args=[666666])
        f_resp = self.client.get(f_url)
        
        self.assertEqual(resp.status_code, 200)
        self.assertIn(o.first_name + ' ' + o.last_name, str(resp.content))
        self.assertEqual(f_resp.status_code, 404)

# Form Test
    def test_valid_form(self):
        o = self.create_owner()
        data = {
        'first_name':o.first_name,
        'last_name':o.last_name,
        'home_phone':o.home_phone,
        'work_phone':o.work_phone,
        'cell_phone':o.cell_phone,
        'best_contact':o.best_contact,
        'drivers_license':o.drivers_license,
        }
        form = OwnerForm(data=data)
        self.assertTrue(form.is_valid())

    def test_invalid_form(self):
        o = Owner.objects.create(first_name='18003587', last_name='18003587', \
            home_phone='guyfieri', work_phone='guyfieri', cell_phone='guyfieri', \
            best_contact='18003587', drivers_license='!@#$%')
        data = {
        'first_name':o.first_name,
        'last_name':o.last_name,
        'home_phone':o.home_phone,
        'work_phone':o.work_phone,
        'cell_phone':o.cell_phone,
        'best_contact':o.best_contact,
        'drivers_license':o.drivers_license,
        }
        form= OwnerForm(data=data)
        self.assertFalse(form.is_valid())


# Model Test
class TeamMemberTest(TestCase):

    def create_team_member(self, first_name='Guy', last_name='Fieri'):
        return TeamMember.objects.create(first_name=first_name, last_name=last_name)

    def test_team_member_creation(self):
        t = self.create_team_member()
        self.assertTrue(isinstance(t, TeamMember))
        self.assertEqual(t.__str__(), t.first_name + ' ' + t.last_name)


# View Tests

