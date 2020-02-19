FROM python:3
RUN mkdir /rams
COPY . /rams/
WORKDIR /rams/
RUN pip install --no-cache-dir -r  config/requirements.txt \
    && curl -sL https://deb.nodesource.com/setup_13.x | bash - \ 
    && apt-get update && apt-get install -y nodejs

RUN npx create-react-app frontend
WORKDIR /rams/frontend
RUN npm install --save bootstrap
CMD tail -f /dev/null