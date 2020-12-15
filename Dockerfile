FROM python:3

#change to args
ENV AWS_ACCESS_KEY_ID="" 
ENV AWS_SECRET_ACCESS_KEY=""
RUN bash - \
    && apt-get update && apt-get install -y nginx sudo \
    && pip install uwsgi \
    && mkdir /home/shelterly \
    && useradd shelterly --user-group -d /home/shelterly \
    && chown shelterly:shelterly /home/shelterly \
    && adduser shelterly sudo \
    # get rid of sudo access
    && echo 'shelterly ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

USER shelterly
WORKDIR /home/shelterly/

COPY .  /home/shelterly
RUN python3 -m venv /home/shelterly/venv \
    && echo 'source /home/shelterly/venv/bin/activate' >> ~/.bashrc \
    && . /home/shelterly/venv/bin/activate \
    && sudo rm /etc/nginx/sites-enabled/default \
    && sudo mkdir /var/log/uwsgi \
    && sudo ln -s /home/shelterly/config/nginx_config.conf /etc/nginx/sites-enabled/ \
    && pip install --upgrade pip virtualenv \
    && pip install --no-cache-dir -r /home/shelterly/requirements.txt \
    && sudo chmod +x /home/shelterly/scripts/startup.sh \
    && sudo chmod +x /home/shelterly/scripts/migrate.sh
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["/home/shelterly/scripts/startup.sh"]
