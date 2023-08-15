FROM node:18.17.0-alpine3.18

WORKDIR /home/node/app

COPY ./package.json ./
RUN npm install
COPY ./ ./

# CMD ["npm", "run", "migrate"]