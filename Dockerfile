FROM node:14.15.4 AS builder
COPY ./shelterly/frontend  /tmp/shelterly/frontend
WORKDIR /tmp/shelterly/frontend
RUN npm install
RUN npm run build

FROM public.ecr.aws/lambda/python:3.8
#change to args
ENV AWS_ACCESS_KEY_ID="" 
ENV AWS_SECRET_ACCESS_KEY=""
COPY ./shelterly  ./
# COPY --from=builder /tmp/shelterly/frontend/build  ./frontend/build

# COPY --from=builder /tmp/shelterly/frontend/build ./frontend/build
RUN pip install --no-cache-dir -r ./requirements.txt \
    && python ./manage.py collectstatic --no-input

CMD [ "lambda_awsgi.lambda_handler" ]
