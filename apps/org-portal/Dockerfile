FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app/
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

FROM base AS production-deps
WORKDIR /app/
ADD package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

FROM base AS build
WORKDIR /app/
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN yarn build

FROM base
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ENV PORT=3000

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
WORKDIR /app

CMD ["yarn", "start"]
EXPOSE 3000
