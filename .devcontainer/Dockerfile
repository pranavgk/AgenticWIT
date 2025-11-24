FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install additional dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    postgresql-client \
    redis-tools \
    curl \
    vim \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    pnpm \
    yarn \
    typescript \
    ts-node \
    nodemon \
    @nestjs/cli \
    prisma

# Set up working directory
WORKDIR /workspace

# Switch to non-root user
USER node
