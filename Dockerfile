# Stage 1: Build
FROM node:20.18 as builder

# Set working directory
WORKDIR /app

# Copy package manager files
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json ./
RUN pnpm install

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript code
RUN pnpm run build

# Stage 2: Runtime
FROM node:20.18-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package manager files
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy the build output and other necessary files
COPY --from=builder /app/dist ./dist
COPY .env .

# Set environment variables
ENV NODE_ENV=production

# Expose the port your Express server listens on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
