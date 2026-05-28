# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite application and server (outputs to /dist)
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:20-alpine

WORKDIR /app

# We only need package.json for runtime scripts if needed, and dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the build output
COPY --from=builder /app/dist ./dist
# If you have a public folder or anything else that needs copying at runtime
# COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/server.cjs"]
