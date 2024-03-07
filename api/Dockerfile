FROM node:16-alpine

WORKDIR /api

COPY ./package*.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start:migrate"]
