#!/bin/bash
source /home/shelterly/venv/bin/activate
python ./manage.py migrate
sudo service nginx restart
sudo uwsgi --ini /home/shelterly/config/uwsgi_config.ini