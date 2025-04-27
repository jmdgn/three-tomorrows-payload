FROM node:18

WORKDIR /app

COPY . .

RUN npm install

ENV NODE_ENV=production
ENV RAILWAY_STATIC_URL=https://three-tomorrows-payload-production.up.railway.app
ENV NEXT_PUBLIC_SERVER_URL=https://three-tomorrows-payload-production.up.railway.app
ENV PAYLOAD_PUBLIC_SERVER_URL=https://three-tomorrows-payload-production.up.railway.app

RUN npm run build:railway

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]