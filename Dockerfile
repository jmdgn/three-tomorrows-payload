FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json* ./
RUN npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 3000
ENV PORT=3000

# Use the existing server.js file
CMD ["node", "server.js"]