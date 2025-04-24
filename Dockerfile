# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package and build override files first
COPY package*.json build-override.js ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment for build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_IS_BUILD=true

# Build using our override script
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]