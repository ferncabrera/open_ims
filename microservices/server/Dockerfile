FROM node:18.17.0-alpine3.18 as builder

WORKDIR /home/node/app

COPY ./package.json ./
USER root
RUN npm install
COPY ./ ./

RUN npm run build
RUN chown -R node:node /home/node/app


FROM node:18.17.0-alpine3.18

WORKDIR /home/node/app

EXPOSE 3000

COPY --from=builder /home/node/app/dist ./dist
COPY ./package.json ./
RUN npm install --omit=dev
CMD ["npm", "run", "start"]
USER node