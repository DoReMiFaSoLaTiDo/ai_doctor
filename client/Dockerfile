FROM node:18-alpine

WORKDIR /client

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "preview" ]