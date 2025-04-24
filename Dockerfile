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

# Create a .env.build file with special flags for build time
RUN echo "PAYLOAD_SECRET=temporary-build-secret-not-for-production" > .env.build
RUN echo "MONGODB_URI=mongodb://localhost:27017/placeholder-db" >> .env.build
RUN echo "NEXT_PUBLIC_SERVER_URL=http://localhost:3000" >> .env.build
RUN echo "PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000" >> .env.build
# This is the important flag to skip actual DB connection during build
RUN echo "PAYLOAD_SKIP_DATABASE=true" >> .env.build

# Build Next.js with the build-specific env file
RUN cp .env.build .env
RUN NEXT_PUBLIC_IS_BUILD=true npm run build

# Remove the dummy .env file as we'll use real environment variables at runtime
RUN rm .env .env.build

# Expose the port the app runs on
EXPOSE 3000

# Start your custom Express server or Next.js
# This will use the environment variables provided by Render at runtime
CMD ["npm", "start"]