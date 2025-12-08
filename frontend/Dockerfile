# frontend/Dockerfile
# Build and serve the React (CRACO) app on Cloud Run

FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the production bundle
RUN npm run build

# Install a simple static server
RUN npm install -g serve

# Cloud Run will set PORT, but we default to 8080
ENV PORT=8080

# Serve the build directory
CMD ["serve", "-s", "build", "-l", "8080"]

