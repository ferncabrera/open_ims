FROM node:18.17.0-alpine3.18 as builder

WORKDIR /app

COPY ./package.json ./
RUN npm install
COPY ./ ./

RUN npm run build

# Slightly slimmed production image
# **Needs more looking into**
FROM node:18.17.0-alpine3.18

WORKDIR /app

EXPOSE 3000

COPY --from=builder ./app/dist ./dist
COPY ./package.json ./
RUN npm install --omit=dev
CMD ["npm", "run", "start"]