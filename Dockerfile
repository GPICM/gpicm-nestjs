FROM node:slim AS development


RUN apt-get update -y \
    && apt-get install -y openssl python3 build-essential \
    && rm -rf /var/lib/apt/lists/*  

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY database ./database

RUN yarn run prisma:generate

RUN chown -R node:node node_modules/.prisma

COPY  . .

EXPOSE 3000

CMD ["sh", "-c", "npm run db:deploy && yarn start:dev"]


FROM node:slim  AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

COPY --chown=node:node database ./database

RUN yarn run prisma:generate

RUN yarn build

ENV NODE_ENV=production

RUN yarn install --frozen-lockfile --production && yarn cache clean

USER node

FROM node:slim  AS production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/database ./database
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/src/main"]

