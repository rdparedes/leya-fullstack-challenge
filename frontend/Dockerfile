FROM --platform=linux/arm64 node:22.9-alpine3.20

WORKDIR /app

COPY app/package.json ./
RUN npm install yarn
RUN yarn install

EXPOSE 3000

CMD ["yarn", "run", "dev"]
