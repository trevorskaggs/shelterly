from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

class MediaStorage(S3Boto3Storage):

    location = 'media'

class StaticStorage(S3Boto3Storage):
    
    location = 'static/%s' % (settings.SHELTERLY_VERSION)
