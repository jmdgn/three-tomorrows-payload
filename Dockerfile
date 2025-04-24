# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_PUBLIC_IS_BUILD=true
ENV PAYLOAD_SECRET=temporary-secret-for-build-only
ENV DATABASE_URI=mongodb://localhost:27017/temp-db
ENV MONGODB_URI=mongodb://localhost:27017/temp-db
ENV NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Create dummy .env file for build
RUN echo "PAYLOAD_SECRET=temporary-secret-for-build-only" > .env
RUN echo "DATABASE_URI=mongodb://localhost:27017/temp-db" >> .env
RUN echo "MONGODB_URI=mongodb://localhost:27017/temp-db" >> .env
RUN echo "NEXT_PUBLIC_SERVER_URL=http://localhost:3000" >> .env
RUN echo "PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000" >> .env
RUN echo "NEXT_PUBLIC_IS_BUILD=true" >> .env

# Build the application
RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build

# Remove the build-specific environment file
RUN rm -f .env

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]