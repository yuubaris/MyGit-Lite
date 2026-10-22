FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/var/lib/mygit

WORKDIR /opt/mygit

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY schema.sql manage.py wsgi.py gunicorn.conf.py ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod -R a+rX /opt/mygit \
    && chmod 0755 /usr/local/bin/docker-entrypoint.sh \
    && addgroup -S -g 1000 mygit \
    && adduser -S -D -H -u 1000 -G mygit mygit \
    && mkdir -p /var/lib/mygit \
    && chown -R mygit:mygit /var/lib/mygit

USER mygit

EXPOSE 8443

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["gunicorn", "-c", "gunicorn.conf.py", "wsgi:app"]
