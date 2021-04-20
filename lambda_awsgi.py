from apig_wsgi import make_lambda_handler
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

application = get_wsgi_application()

lambda_handler = make_lambda_handler(application)
