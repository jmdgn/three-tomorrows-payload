FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ensure .env is included (Render will pass env vars automatically, so optional)
COPY .env .env

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
