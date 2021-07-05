import argparse
import sys
sys.path.append('/var/task')
sys.path.append('/home/sheltuser/shelterly')
import django
django.setup()
from django.conf import settings
from accounts.models import ShelterlyUser
from evac.models import EvacTeamMember
from django.db import IntegrityError
from pathlib import Path
import csv

parser = argparse.ArgumentParser(description='Load users and/or admins for an organization')
parser.add_argument("path", type=Path)
parser.add_argument("--admins", help="load only admins", action="store_true")
args = parser.parse_args()

with open(args.path, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f, fieldnames=['first_name','last_name','email','cell_phone','agency_id','shelterly_user', 'team_member', 'shelterly_lead', 'shelterly_admin'])
    # skip first line w/ header info
    next(reader)
    a = list(reader)

## Temporary for support of spinning up instance BEFOREHAND
## TODO: Remove when LaunchPad is available.
admins_only = args.admins
for item in a:
    if item['shelterly_user'] == 'yes':
        shelterly_lead = item['shelterly_lead'] == 'yes'
        super_user = item['shelterly_admin'] == 'yes'
        if not admins_only or (admins_only and shelterly_lead):
            try:
                import ipdb; ipdb.set_trace()
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
        except (IntegrityError, MultipleObjectsReturned):
            print('failed for {0}'.format(item))
            pass
