FROM public.ecr.aws/docker/library/nginx:latest

EXPOSE 80

RUN rm -f /etc/nginx/nginx.conf \
  && rm -rf /etc/nginx/conf.d/*

COPY ./nginx.conf /etc/nginx/
COPY ./conf.d /etc/nginx/conf.d/
