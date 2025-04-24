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

# Build Next.js
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start your app
CMD ["npm", "start"]
