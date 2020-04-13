FROM node:13
WORKDIR /portal/

# LABELS
LABEL maintainer="webmaster@i-npz.ru"
LABEL vendor="INPZ"

# APPLICATION PARAMETERS
ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

ARG PORT=4000
ENV PORT ${PORT}
ARG PORT_SSL=4443
ENV PORT_SSL ${PORT_SSL}

# Database
ARG DATABASE_URI=postgres://postgres:1234567890@localhost:5432/portaldb
ENV DATABASE_URI ${DATABASE_URI}
ARG DATABASE_URI_RD=postgres://postgres:1234567890@localhost:5432/portaldb
ENV DATABASE_URI_RD ${DATABASE_URI_RD}
ARG DATABASE_SCHEMA=public
ENV DATABASE_SCHEMA ${DATABASE_SCHEMA}
ARG DATABASE_SYNCHRONIZE=true
ENV DATABASE_SYNCHRONIZE ${DATABASE_SYNCHRONIZE}
ARG DATABASE_DROP_SCHEMA=true
ENV DATABASE_DROP_SCHEMA ${DATABASE_DROP_SCHEMA}
ARG DATABASE_MIGRATIONS_RUN=true
ENV DATABASE_MIGRATIONS_RUN ${DATABASE_MIGRATIONS_RUN}
ARG DATABASE_LOGGING=true
ENV DATABASE_LOGGING ${DATABASE_LOGGING}
# Database Redis
ARG DATABASE_REDIS_URI=redis://localhost:6379/0
ENV DATABASE_REDIS_URI ${DATABASE_REDIS_URI}
ARG DATABASE_REDIS_TTL=300
ENV DATABASE_REDIS_TTL ${DATABASE_REDIS_TTL}

# HTTP Redis
ARG HTTP_REDIS_URI=redis://localhost:6379/1
ENV HTTP_REDIS_URI ${HTTP_REDIS_URI}
ARG HTTP_REDIS_TTL=300
ENV HTTP_REDIS_TTL ${HTTP_REDIS_TTL}
ARG HTTP_REDIS_MAX_OBJECTS=10000
ENV HTTP_REDIS_MAX_OBJECTS ${HTTP_REDIS_MAX_OBJECTS}
# ARG HTTP_REDIS_PREFIX
# ENV HTTP_REDIS_PREFIX ${HTTP_REDIS_PREFIX}

# Session Redis
ARG SESSION_NAME=portal
ENV SESSION_NAME ${SESSION_NAME}
ARG SESSION_REDIS_URI=redis://localhost:6379/2
ENV SESSION_REDIS_URI ${SESSION_REDIS_URI}
ARG SESSION_COOKIE_TTL=300
ENV SESSION_COOKIE_TTL ${SESSION_COOKIE_TTL}
ARG SESSION_SECRET="supersecret"
ENV SESSION_SECRET ${SESSION_SECRET}

# LDAP
ARG LDAP_URL=ldap://pdc:389
ENV LDAP_URL ${LDAP_URL}
ARG LDAP_BIND_DN="CN\=user\,DC\=example\,DC\=local"
ENV LDAP_BIND_DN ${LDAP_BIND_DN}
ARG LDAP_BIND_PW=1234567890
ENV LDAP_BIND_PW ${LDAP_BIND_PW}
ARG LDAP_SEARCH_BASE="DC\=example\,DC\=local"
ENV LDAP_SEARCH_BASE ${LDAP_SEARCH_BASE}
ARG LDAP_SEARCH_FILTER="(sAMAccountName\={{username}})"
ENV LDAP_SEARCH_FILTER ${LDAP_SEARCH_FILTER}
ARG LDAP_SEARCH_GROUP="(&(objectClass=group)(member={{dn}}))"
ENV LDAP_SEARCH_GROUP ${LDAP_SEARCH_GROUP}
ARG LDAP_SEARCH_BASE_ALL_USERS="DC\=example\,DC\=local"
ENV LDAP_SEARCH_BASE_ALL_USERS ${LDAP_SEARCH_BASE_ALL_USERS}
ARG LDAP_SEARCH_FILTER_ALL_USERS="(\&(\&(\|(\&(objectClass\=user)(objectCategory\=person))(&(objectClass\=contact)(objectCategory\=person)))))"
ENV LDAP_SEARCH_FILTER_ALL_USERS ${LDAP_SEARCH_FILTER_ALL_USERS}

# LDAP Redis
ARG LDAP_REDIS_URI=redis://localhost:6379/3
ENV LDAP_REDIS_URI ${LDAP_REDIS_URI}
ARG LDAP_REDIS_TTL=300
ENV LDAP_REDIS_TTL ${LDAP_REDIS_TTL}

# Microservices
ARG MICROSERVICE_URL=redis://localhost:6379
ENV MICROSERVICE_URL ${MICROSERVICE_URL}

# SOAP
ARG SOAP_URL="https://soap1c"
ENV SOAP_URL ${SOAP_URL}
ARG SOAP_DOMAIN="EXAMPLE"
ENV SOAP_DOMAIN ${SOAP_DOMAIN}

# News
ARG NEWS_URL="https://news"
ENV NEWS_URL ${NEWS_URL}
ARG NEWS_API_URL="https://news/api"
ENV NEWS_API_URL ${NEWS_API_URL}

# Mail
ARG MAIL_URL="https://portal"
ENV MAIL_URL ${MAIL_URL}
ARG MAIL_LOGIN_URL="https://roundcube.mail/login/index.php"
ENV MAIL_LOGIN_URL ${MAIL_LOGIN_URL}

# Meeting
ARG MEETING_URL="https://meeting"
ENV MEETING_URL ${MEETING_URL}


# PREPARE DEVELOPMENT
#RUN apt-get update && apt-get install -y \
#  net-tools \ip
#  telnet \
#  dnsutils \
#  nano \
#  && rm -rf /var/lib/apt/lists/*

# FOR BUILD
# RUN set -ex; \
#   apt-get update \
#   && apt-get install -y openssl libpq-dev

RUN ln -fs /usr/share/zoneinfo/Europe/Moscow /etc/localtime
RUN dpkg-reconfigure -f noninteractive tzdata

# COPY
COPY . ./

# EXPOSE
EXPOSE ${PORT} ${PORT_SSL}

# YARN START
ENTRYPOINT [ "./entrypoint.sh" ]
CMD [ "start" ]
