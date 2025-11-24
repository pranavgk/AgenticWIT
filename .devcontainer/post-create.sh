#!/bin/bash

echo "🚀 Setting up AgenticWIT development environment..."

# Install backend dependencies if package.json exists
if [ -f "backend/package.json" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if package.json exists
if [ -f "frontend/package.json" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -p 5432 -U agentic; do
    sleep 1
done

echo "✅ PostgreSQL is ready!"

# Run database migrations if they exist
if [ -f "backend/prisma/schema.prisma" ]; then
    echo "🗄️  Running database migrations..."
    cd backend && npx prisma migrate dev --name init && cd ..
fi

# Set up git hooks
echo "🪝 Setting up git hooks..."
git config core.hooksPath .githooks

echo "✨ Development environment setup complete!"
echo ""
echo "🎯 Quick Start:"
echo "   1. Backend: cd backend && npm run dev"
echo "   2. Frontend: cd frontend && npm run dev"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - IMPLEMENTATION-PLAN.md - Development roadmap"
echo "   - .github/AGENT-ASSIGNMENTS.md - AI agent guide"
