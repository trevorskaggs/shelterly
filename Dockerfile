FROM python:3

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get update && apt-get install -y nodejs vim sudo \
    && mkdir /home/shelterly
RUN useradd shelterly --user-group -d /home/shelterly \
    && chown shelterly:shelterly /home/shelterly \
    && adduser shelterly sudo \
    && echo 'shelterly ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
USER shelterly
WORKDIR /home/shelterly
RUN git clone https://github.com/trevorskaggs/shelterly.git . \
    && pip install --upgrade pip virtualenv \
    && python3 -m venv /home/shelterly/venv
WORKDIR /home/shelterly/frontend
RUN npm install
WORKDIR /home/shelterly/
RUN git clone https://github.com/magicmonty/bash-git-prompt.git .bash-git-prompt --depth=1 \
    && echo 'GIT_PROMPT_ONLY_IN_REPO=1' >> ~/.bashrc \
    && echo 'GIT_PROMPT_FETCH_REMOTE_STATUS=0' >> ~/.bashrc \
    && echo 'source ~/.bash-git-prompt/gitprompt.sh' >> ~/.bashrc \
    && echo 'source /home/shelterly/venv/bin/activate' >> ~/.bashrc \
    && . /home/shelterly/venv/bin/activate \
    && pip install --no-cache-dir -r /home/shelterly/requirements.txt
SHELL ["/bin/bash", "-c"]
CMD tail -f /dev/null
