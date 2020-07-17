#!/bin/bash
sudo service nginx restart
sudo uwsgi --ini /home/shelterly/config/uwsgi_config.ini