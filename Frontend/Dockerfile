FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV CI=true
ENV HOST=0.0.0.0

CMD ["npm", "start"]
