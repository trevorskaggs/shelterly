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
    reader = csv.DictReader(f, fieldnames=['first_name','last_name','email','cell_phone','agency_id','shelterly_user', 'team_member', 'admin'])
    # skip first line w/ header info
    next(reader)
    a = list(reader)

## Temporary for support of spinning up instance BEFOREHAND
## TODO: Remove when LaunchPad is available.
admins_only = bool(sys.args[2])

for item in a:
    if item['shelterly_user'] == 'yes':
        super_user = item['admin'] == 'yes'
        if not admins_only or (admins_only and super_user):
            try:
                user = ShelterlyUser.objects.create_user(
                    first_name=item['first_name'],
                    last_name=item['last_name'],
                    email=item['email'],
                    cell_phone=item['cell_phone'],
                    username=item['email'],
                    password=item['last_name'] + '1',
                    is_superuser=super_user
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
        except IntegrityError:
            print('failed for {0}'.format(item))
            pass
