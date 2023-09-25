FROM node:18.17.0-alpine3.18 as builder

WORKDIR /home/node/app

COPY ./package.json ./
RUN npm install
COPY ./ ./

RUN npm run build
RUN chown -R node:node /home/node/app/dist


FROM node:18.17.0-alpine3.18

WORKDIR /home/node/app

EXPOSE 3000

COPY ./package.json ./
RUN npm install --omit=dev
RUN chown -R node:node /home/node/app

COPY --from=builder /home/node/app/dist ./dist

CMD ["npm", "run", "start"]