FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG MONGODB_URI
ARG JWT_SECRET

ENV MONGODB_URI=$MONGODB_URI
ENV JWT_SECRET=$JWT_SECRET


EXPOSE 3000

CMD ["node", "src/server.js"]
