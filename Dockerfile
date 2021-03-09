FROM node:12.21.0-alpine3.10

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./

USER node
RUN npm install

COPY --chown=node:node . .

ENV domain localhost
ENV asPort 3004
EXPOSE 3005

CMD ["sh", "-c", "npm start"]
