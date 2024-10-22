FROM --platform=linux/arm64 node:22.9-alpine

WORKDIR /app

COPY src/package*.json ./
RUN npm install

COPY src/prisma ./prisma

EXPOSE 4000

RUN npx prisma generate

CMD ["npm", "run", "dev"]
