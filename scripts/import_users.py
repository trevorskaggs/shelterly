import sys
sys.path.append('/var/task')
import django
django.setup()
from django.conf import settings
from accounts.models import ShelterlyUser
from evac.models import EvacTeamMember
from django.db import IntegrityError
import csv

with open(sys.argv[1], newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f, fieldnames=['first_name','last_name','email','cell_phone','agency_id','shelterly_user', 'team_member'])
    # skip first line w/ header info
    next(reader)
    a = list(reader)

for item in a:
    if item['shelterly_user'] == 'yes':
        try:
            user = ShelterlyUser.objects.create_user(
                first_name=item['first_name'],
                last_name=item['last_name'],
                email=item['email'],
                cell_phone=item['cell_phone'],
                username=item['email'],
                password=item['last_name'] + '1'
            )
            print(user)
        except IntegrityError:
            print('failed for {0}'.format(item))
            pass
    if item['team_member'] == 'yes':
        try:
            member, _ = EvacTeamMember.objects.get_or_create(
                first_name=item['first_name'],
                last_name=item['last_name'],
                phone=item['cell_phone'],
                agency_id=item['agency_id']
            )
            print(member)
        except IntegrityError, MultipleObjectsReturned:
            print('failed for {0}'.format(item))
            pass
