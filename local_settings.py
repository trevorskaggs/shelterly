DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('DB_NAME', 'rams2'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASS', 'P3pp3r'),
        'HOST': 'localhost',
        'PORT': 5432
    }
}
