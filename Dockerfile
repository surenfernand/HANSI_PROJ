FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /srv/site/index.html
COPY assets/ /srv/site/assets/
COPY 01-coral-sky/ /srv/site/01-coral-sky/
COPY 02-cobalt-peach/ /srv/site/02-cobalt-peach/
COPY 03-rose-butter/ /srv/site/03-rose-butter/
COPY 04-terracotta-sand/ /srv/site/04-terracotta-sand/
COPY 05-navy-apricot/ /srv/site/05-navy-apricot/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
