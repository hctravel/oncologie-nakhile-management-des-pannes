FROM node:18-alpine

WORKDIR /app

# Install dumb-init and bash
RUN apk add --no-cache dumb-init bash

# Copy package files
COPY package*.json ./

# Install dependencies (both production and dev for flexibility)
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
