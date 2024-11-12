# Stage 1: Build
FROM node:20.18-alpine as builder

# Set working directory
WORKDIR /app

USER antho

# Install pnpm
RUN npm install -g pnpm

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies, including dev dependencies
RUN pnpm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./
COPY drizzle.config.ts ./drizzle.config.ts

# Build the application
RUN pnpm build

# Stage 2: Production
FROM node:20.18-alpine as production

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/dist /app/dist/
COPY --from=builder /app/node_modules /app/node_modules

# Expose the port your Express server listens on
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
