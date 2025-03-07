FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=node:node database ./database

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["yarn", "start:dev"]

FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

COPY --chown=node:node database ./database

RUN yarn build

ENV NODE_ENV=production

RUN yarn install --frozen-lockfile --production && yarn cache clean

USER node

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/database ./database
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/src/main"]
