# Use the official Node.js image as the base image / Criando um apelido alias
FROM node:20.18 AS base

# Set the working directory in the container
RUN npm i -g pnpm

FROM base AS dependencies

# Copy the entire server directory to the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and pnpm-lock.yaml files to the working directory
COPY package.json pnpm-lock.yaml ./

# Install the dependencies
RUN pnpm install

FROM base AS build

WORKDIR /usr/src/app

# Copy the rest of the server files to the working directory in the container
COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules


RUN pnpm build
RUN pnpm prune --prod

FROM node:20-alpine3.21 AS deploy

# Set the working directory in the container
RUN npm i -g pnpm

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

ENV CLOUDFLARE_ACCESS_KEY_ID="ad8709e1247a36099d2c20be062285c3"
ENV CLOUDFLARE_SECRET_ACCESS_KEY="dee1e9ab8137b3ac87e62c2ef6f77b75fa0d67d809eda6b4ed25b71c5d91d0f3"
ENV CLOUDFLARE_BUCKET="upload-widget2"
ENV CLOUDFLARE_ACCOUNT_ID="c6c4cbe5e382940704167886caead2d5"
ENV CLOUDFLARE_PUBLIC_URL="https://pub-095af489f5ff43748885e277a5849815.r2.dev"

# Expose the port that the server will run on
EXPOSE 3333

# Start the server using the development script defined in package.json
CMD ["node" , "dist/server.mjs"]