# Use an official Node LTS base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Set ENV VARS for build
ARG PAYLOAD_SECRET
ARG MONGODB_URI
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV MONGODB_URI=$MONGODB_URI

# Build Next.js
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start your custom Express server or Next.js
CMD ["npm", "start"]
