FROM node:14-buster
RUN mkdir -p /srv/app
WORKDIR /srv/app
COPY package.json yarn.lock ./
RUN yarn --production --frozen-lockfile --non-interactive

COPY . /srv/app
ENV NODE_ENV production
RUN yarn build
EXPOSE 8000
CMD [ "yarn", "start" ]
