# Alpine Trail Guardian - Frontend Development
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p public src

# Expose port 3000 for development
EXPOSE 3000

# Development mode with hot reload
CMD ["npm", "run", "dev"]