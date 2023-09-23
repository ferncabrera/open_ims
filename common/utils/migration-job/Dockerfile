FROM node:18.17.0-alpine3.18

WORKDIR /home/node/app

COPY ./package.json ./
USER root
RUN npm install
COPY ./ ./
USER node

# CMD ["npm", "run", "migrate"]