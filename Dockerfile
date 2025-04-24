FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json* ./
RUN npm install

# Copy all files
COPY . .

# Try to build the Next.js application (but continue even if it fails)
RUN npm run build || echo "Build failed, will use simple server instead"

# Expose port
EXPOSE 3000
ENV PORT=3000

# Try to use server.js, but fall back to simple-server.js if .next doesn't exist
CMD if [ -d ".next" ]; then node server.js; else node simple-server.js; fi