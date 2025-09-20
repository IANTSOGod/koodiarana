# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy all source code
COPY . .

# Build TypeScript
RUN pnpm run build

# Expose port
EXPOSE 9999

# Run the app
CMD ["node", "dist/main.js"]
