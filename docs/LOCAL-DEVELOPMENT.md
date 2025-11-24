# Local Development Setup Guide

This guide will help you set up a complete local development environment for AgenticWIT using VS Code devcontainers.

## Prerequisites

- **Visual Studio Code** with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git** for version control
- **GitHub CLI** (optional, for issue management)

## Quick Start

### 1. Open in DevContainer

```bash
# Clone the repository
git clone https://github.com/pranavgk/AgenticWIT.git
cd AgenticWIT

# Open in VS Code
code .
```

When VS Code opens, you'll see a notification: **"Reopen in Container"**. Click it, or:
- Press `F1` → "Dev Containers: Reopen in Container"

### 2. Wait for Setup

The devcontainer will:
- ✅ Build the development environment
- ✅ Install Node.js 20, PostgreSQL 15, Redis 7
- ✅ Install VS Code extensions
- ✅ Run post-create setup script
- ✅ Install dependencies (if projects exist)

This takes **3-5 minutes** on first run.

### 3. Verify Setup

```bash
# Check Node.js
node --version  # Should show v20.x

# Check database
psql -h localhost -U agentic -d agentic_wit -c "SELECT version();"
# Password: devpassword

# Check Redis
redis-cli -a devpassword ping
# Should return: PONG
```

## What's Included

### Development Services

| Service | Port | Credentials |
|---------|------|-------------|
| **Frontend (Next.js)** | 3000 | N/A |
| **Backend API (Node.js)** | 3001 | N/A |
| **PostgreSQL** | 5432 | User: `agentic`, Pass: `devpassword`, DB: `agentic_wit` |
| **Redis** | 6379 | Pass: `devpassword` |

### VS Code Extensions

Pre-installed extensions:
- ESLint & Prettier (code quality)
- TypeScript support
- PostgreSQL tools
- Docker management
- Jest & Playwright (testing)
- Axe accessibility linter
- REST Client
- GitLens

### Environment Variables

Create `.env` files in `backend/` and `frontend/`:

**backend/.env.local**
```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://agentic:devpassword@localhost:5432/agentic_wit

# Redis
REDIS_URL=redis://:devpassword@localhost:6379

# JWT Secret (dev only)
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**frontend/.env.local**
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development Workflow

### Backend Development

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

Backend will run on **http://localhost:3001**

### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run accessibility tests
npm run test:a11y

# Build for production
npm run build
```

Frontend will run on **http://localhost:3000**

### Database Management

```bash
# Connect to PostgreSQL
psql -h localhost -U agentic -d agentic_wit

# Create a new migration
cd backend
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio (DB GUI)
npx prisma studio
```

### Redis Management

```bash
# Connect to Redis CLI
redis-cli -a devpassword

# Common commands:
KEYS *           # List all keys
GET key          # Get value
SET key value    # Set value
FLUSHALL         # Clear all data (careful!)
```

## Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Backend integration tests
npm run test:integration

# Backend with coverage
npm run test:coverage

# Frontend tests
cd frontend && npm test

# E2E tests (Playwright)
cd frontend && npm run test:e2e

# Accessibility tests
npm run test:a11y
```

## Using AI Agents

With Agent HQ in VS Code, you can work with specialized agents:

```bash
# Start work on an issue
@workspace Fix issue #5

# Invoke specific agent
@backend-agent Create user authentication endpoints

# Verify work
@verification-agent Review my authentication implementation
```

See [`.github/AGENT-ASSIGNMENTS.md`](../.github/AGENT-ASSIGNMENTS.md) for the complete guide.

## Common Tasks

### Create a New Backend Service

```bash
cd backend/src/services

# Create service directory
mkdir my-service
cd my-service

# Create service files
touch my-service.service.ts
touch my-service.controller.ts
touch my-service.routes.ts
touch my-service.types.ts
```

### Create a New Frontend Component

```bash
cd frontend/components

# Create component
mkdir my-component
cd my-component

touch my-component.tsx
touch my-component.test.tsx
touch my-component.module.css
```

### Add a Database Table

```bash
cd backend

# Edit prisma/schema.prisma
# Add your model

# Create migration
npx prisma migrate dev --name add_my_table

# Update Prisma client
npx prisma generate
```

## Troubleshooting

### DevContainer Won't Start

```bash
# Rebuild container
F1 → "Dev Containers: Rebuild Container"

# Check Docker is running
docker ps

# View logs
docker-compose -f .devcontainer/docker-compose.yml logs
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose -f .devcontainer/docker-compose.yml restart db

# Check logs
docker-compose -f .devcontainer/docker-compose.yml logs db
```

### Port Already in Use

```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill the process or change port in code
```

### Dependencies Won't Install

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf backend/node_modules frontend/node_modules

# Reinstall
cd backend && npm install
cd ../frontend && npm install
```

### Prisma Client Issues

```bash
cd backend

# Regenerate client
npx prisma generate

# If still issues, reset
npx prisma migrate reset
npx prisma generate
```

## VS Code Tips

### Keyboard Shortcuts

- `Ctrl+Shift+P` (F1) - Command palette
- `Ctrl+`` - Toggle terminal
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Search across files
- `F12` - Go to definition
- `Alt+Shift+F` - Format document

### Recommended Workspace Settings

Already configured in `.devcontainer/devcontainer.json`:
- Format on save
- ESLint auto-fix
- TypeScript path mapping
- Multi-root workspace support

## Next Steps

Now that your devbox is set up:

1. **Start with Phase 1, Task 5** (Authentication & User Service)
   - Issue: [#5](https://github.com/pranavgk/AgenticWIT/issues/5)
   - This doesn't require cloud infrastructure

2. **Follow the Implementation Plan**
   - See [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md)
   - Work through tasks sequentially

3. **Use Agent HQ**
   - Let AI agents help with implementation
   - Always verify with `@verification-agent`

4. **Test Locally First**
   - Build and test everything in devbox
   - Deploy to Azure only when ready

## Getting Help

- **Documentation**: Check `specs/` directory
- **Issues**: [GitHub Issues](https://github.com/pranavgk/AgenticWIT/issues)
- **Agent Guide**: [`.github/AGENT-ASSIGNMENTS.md`](../.github/AGENT-ASSIGNMENTS.md)
- **Specifications**: [`specs/comprehensive-spec.md`](../specs/comprehensive-spec.md)

---

**Happy coding! 🚀**
