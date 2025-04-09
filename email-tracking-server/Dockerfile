FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=2048" yarn build

EXPOSE 3001

CMD ["node","dist/src/main"]