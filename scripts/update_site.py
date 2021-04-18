import sys
sys.path.append('/var/task')
import django
django.setup()
from django.conf import settings
from django.contrib.sites.models import Site

domain = sys.argv[1]
site = Site.objects.all()[0]
site.domain = domain
site.name = domain
site.save()