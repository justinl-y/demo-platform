FROM public.ecr.aws/docker/library/nginx:latest

EXPOSE 80

RUN rm /etc/nginx/nginx.conf
RUN rm etc/nginx/conf.d/*

ADD ./nginx.conf /etc/nginx/
ADD ./conf.d /etc/nginx/conf.d/
