# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create production image
FROM node:20-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
