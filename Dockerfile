FROM public.ecr.aws/lambda/python:3.8
RUN yum -y install git \
    && git clone https://github.com/trevorskaggs/shelterly.git \
    && cd shelterly \
    && git checkout deploy \
    && pip install --upgrade pip virtualenv \
    && python3 -m venv /home/sheltuser/shelterly/venv \
    && python3 -m pip install -r ./requirements.txt
CMD [ "lambda_awsgi.lambda_handler" ]
