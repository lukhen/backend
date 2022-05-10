FROM node:17.0-alpine3.14

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json

RUN npm ci

COPY ./ /usr/src/app

RUN npm run tsc

CMD ["npm", "start"]
