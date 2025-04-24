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

# Create a dummy .env file with placeholder values for build time
RUN echo "PAYLOAD_SECRET=temporary-build-secret-not-for-production" > .env
RUN echo "MONGODB_URI=mongodb://localhost:27017/placeholder-db" >> .env
RUN echo "NEXT_PUBLIC_SERVER_URL=http://localhost:3000" >> .env
RUN echo "PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000" >> .env

# Build Next.js
RUN npm run build

# Remove the dummy .env file as we'll use real environment variables at runtime
RUN rm .env

# Expose the port the app runs on
EXPOSE 3000

# Start your custom Express server or Next.js
# This will use the environment variables provided by Render at runtime
CMD ["npm", "start"]