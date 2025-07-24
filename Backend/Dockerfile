# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production
RUN addgroup --system app && adduser --system --ingroup app app
USER app

# Copy the entire project directory to the working directory
COPY . .

EXPOSE 4000

# Specify the command to run your Node.js application
CMD ["node", "server.js"]