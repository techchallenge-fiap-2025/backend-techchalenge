FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV MONGO_URI="sua_string_mongo_aqui"
ENV JWT_SECRET="seu_secret_aqui"

EXPOSE 3000

CMD ["node", "src/server.js"]
