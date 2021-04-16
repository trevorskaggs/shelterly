FROM public.ecr.aws/lambda/python:3.8
COPY ./  ./
RUN pip install --no-cache-dir -r ./requirements.txt
CMD [ "lambda_awsgi.lambda_handler" ]
