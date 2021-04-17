FROM public.ecr.aws/lambda/python:3.8
RUN yum -y install git \
    && git clone https://github.com/trevorskaggs/shelterly.git . \
    && git checkout deploy \
    && python3 -m pip install -r ./requirements.txt

CMD [ "lambda_awsgi.lambda_handler" ]
