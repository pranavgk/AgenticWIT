# AgenticWIT
Enterprise work item tracking system built with Microsoft Agent HQ orchestration. Modern React/Node.js stack with Azure CDN, accessibility-first design, and comprehensive security.

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Docker Desktop** (for devcontainer)
- **VS Code** with Dev Containers extension
- **Git**

### Setup
```bash
# Clone the repository
git clone https://github.com/pranavgk/AgenticWIT.git
cd AgenticWIT

# Open in VS Code
code .

# When prompted, click "Reopen in Container"
# Or press F1 → "Dev Containers: Reopen in Container"
```

The devcontainer will automatically:
- ✅ Set up Node.js 20, PostgreSQL 15, Redis 7
- ✅ Install all dependencies
- ✅ Configure your development environment

### Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
cp .env.example .env.local
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

📚 **Detailed Setup Guide**: See [`docs/LOCAL-DEVELOPMENT.md`](docs/LOCAL-DEVELOPMENT.md)

## Agent-Based Development

This project uses 9 specialized AI agents coordinated through Microsoft Agent HQ:

- **coordinator-agent** - Project orchestration and task coordination
- **verification-agent** - Output validation and hallucination prevention
- **backend-agent** - API development and microservices
- **frontend-agent** - React UI/UX and accessibility features
- **database-agent** - PostgreSQL schema and optimization
- **testing-agent** - Quality assurance and accessibility testing
- **security-agent** - Security framework and compliance
- **infrastructure-agent** - Azure cloud infrastructure and DevOps
- **documentation-agent** - Technical and user documentation

All agent files are located in `.github/agents/` and are ready for use with Agent HQ.

### How to Use Agent HQ

**Working with Issues:**
```bash
# Agent HQ automatically routes to the right agent based on issue labels
@workspace Fix issue #5

# Or invoke a specific agent directly
@backend-agent Implement authentication per issue #5

# Always verify work before closing
@verification-agent Review the authentication implementation
```

Each GitHub issue has agent labels (e.g., `agent:backend`, `agent:frontend`) that tell Agent HQ which specialized agent to use. See [`.github/AGENT-ASSIGNMENTS.md`](.github/AGENT-ASSIGNMENTS.md) for the complete agent assignment guide.

**Implementation Plan:**
- All 33 tasks are tracked as GitHub issues: [View Issues](https://github.com/pranavgk/AgenticWIT/issues)
- Each task in [`IMPLEMENTATION-PLAN.md`](IMPLEMENTATION-PLAN.md) links to its corresponding issue
- Follow the phase-based sequence for proper dependency management

### Quality Control Process
Every agent's output is validated by the **verification-agent** to ensure:
- No hallucinated APIs, functions, or features
- Code actually compiles and runs
- Specifications are accurately implemented
- Integrations work across components
- Accessibility claims are verified with real testing

## Documentation

- **Specifications**: See `specs/` directory for detailed system specifications
- **Agent Instructions**: See `.github/agents/` for AI agent definitions
- **Architecture**: See `specs/comprehensive-spec.md` for system architecture
