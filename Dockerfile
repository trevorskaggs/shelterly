FROM python:3
ENV PATH="/home/shelterly/.local/bin/:${PATH}"
# For production build, create JS bundle in this stage, send as
# artifact to next stage so smaller image w/o node
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get update && apt-get install -y nodejs vim sudo \
    && mkdir /home/shelterly \
    && useradd shelterly --user-group -d /home/shelterly \
    && chown shelterly:shelterly /home/shelterly \
    && adduser shelterly sudo \
    && echo 'shelterly ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

USER shelterly
WORKDIR /home/shelterly/

RUN git clone https://github.com/trevorskaggs/shelterly.git . \
    && pip install --upgrade pip virtualenv \
    && python3 -m venv /home/shelterly/venv \
    && git clone https://github.com/magicmonty/bash-git-prompt.git .bash-git-prompt --depth=1 \
    && echo 'GIT_PROMPT_ONLY_IN_REPO=1' >> ~/.bashrc \
    && echo 'GIT_PROMPT_FETCH_REMOTE_STATUS=0' >> ~/.bashrc \
    && echo 'alias djangoserver="python ./manage.py runserver 0.0.0.0:8000"' >> ~/.bashrc \
    && echo 'alias npmserver="cd ~/frontend && npm start"' >> ~/.bashrc \
    && echo 'alias deploy="cd ~/frontend && npm run dev && cd .. && python ./manage.py collectstatic --noinput"' >> ~/.bashrc \
    && echo 'GIT_PROMPT_FETCH_REMOTE_STATUS=0' >> ~/.bashrc \
    && echo 'source ~/.bash-git-prompt/gitprompt.sh' >> ~/.bashrc \
    && echo 'source /home/shelterly/venv/bin/activate' >> ~/.bashrc \
    && . /home/shelterly/venv/bin/activate \
    && git checkout master \
    && cd frontend \
    && npm install \
    && cd .. \ 
    && pip install --upgrade pip \
    && pip install --no-cache-dir -r /home/shelterly/requirements.txt
CMD tail -f /dev/null