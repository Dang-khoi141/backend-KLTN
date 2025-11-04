
FROM node:22-alpine AS deps
WORKDIR /app


COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM public.ecr.aws/docker/library/node:lts-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y \
      git gettext \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache gettext

COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY .env.sample ./.env.sample

EXPOSE 3012
CMD ["/bin/sh","-c","envsubst < .env.sample > .env && node dist/main.js"]
