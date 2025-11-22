# AgenticWIT
Enterprise work item tracking system built with Microsoft Agent HQ orchestration. Modern React/Node.js stack with Azure CDN, accessibility-first design, and comprehensive security.

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
