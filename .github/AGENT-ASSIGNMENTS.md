# Agent HQ Issue Assignment Guide

This document explains how GitHub Copilot and Agent HQ determine which agent to use for each issue.

## How Agent Assignment Works

### 1. **Issue Labels**
Each GitHub issue is tagged with one or more agent labels:
- `agent:infrastructure` → Infrastructure Agent
- `agent:backend` → Backend Agent
- `agent:frontend` → Frontend Agent
- `agent:database` → Database Agent
- `agent:testing` → Testing Agent
- `agent:security` → Security Agent
- `agent:documentation` → Documentation Agent
- `agent:coordinator` → Coordinator Agent
- `agent:verification` → Verification Agent

### 2. **Agent HQ Recognition**
When you use `@workspace` or Agent HQ in VS Code:
- Agent HQ reads the issue labels
- Automatically selects the appropriate specialized agent(s)
- Routes the work to that agent's context and expertise

### 3. **Multiple Agents on One Issue**
Some issues require multiple agents (e.g., #4 Database Infrastructure Setup needs both Infrastructure and Database agents):
- Agent HQ will coordinate between agents
- Primary agent (listed first) leads the work
- Secondary agents provide support in their domain

## Agent Assignment by Issue

### Phase 1: Foundation
| Issue | Task | Primary Agent | Supporting Agent(s) |
|-------|------|---------------|---------------------|
| [#1](https://github.com/pranavgk/AgenticWIT/issues/1) | Azure Infrastructure Provisioning | Infrastructure | - |
| [#2](https://github.com/pranavgk/AgenticWIT/issues/2) | CI/CD Pipeline Setup | Infrastructure | - |
| [#3](https://github.com/pranavgk/AgenticWIT/issues/3) | Azure Front Door CDN Setup | Infrastructure | - |
| [#4](https://github.com/pranavgk/AgenticWIT/issues/4) | Database Infrastructure Setup | Infrastructure | Database |
| [#5](https://github.com/pranavgk/AgenticWIT/issues/5) | Authentication & User Service | Backend | Security |
| [#6](https://github.com/pranavgk/AgenticWIT/issues/6) | Testing Framework Setup | Testing | - |
| [#7](https://github.com/pranavgk/AgenticWIT/issues/7) | Documentation Framework | Documentation | - |

### Phase 2: Core Features
| Issue | Task | Primary Agent | Supporting Agent(s) |
|-------|------|---------------|---------------------|
| [#8](https://github.com/pranavgk/AgenticWIT/issues/8) | Project Service Implementation | Backend | Database |
| [#9](https://github.com/pranavgk/AgenticWIT/issues/9) | Work Item Service Foundation | Backend | Database |
| [#10](https://github.com/pranavgk/AgenticWIT/issues/10) | Frontend Project Setup | Frontend | Infrastructure |
| [#11](https://github.com/pranavgk/AgenticWIT/issues/11) | Core UI Components & Accessibility | Frontend | Testing |
| [#12](https://github.com/pranavgk/AgenticWIT/issues/12) | Authentication Pages & User Management UI | Frontend | Security |
| [#13](https://github.com/pranavgk/AgenticWIT/issues/13) | User Dashboard & Navigation | Frontend | - |
| [#14](https://github.com/pranavgk/AgenticWIT/issues/14) | Work Item Creation & Editing UI | Frontend | Backend |
| [#15](https://github.com/pranavgk/AgenticWIT/issues/15) | Kanban Board with Accessibility | Frontend | Testing |
| [#16](https://github.com/pranavgk/AgenticWIT/issues/16) | WebSocket Infrastructure | Backend | Infrastructure |
| [#17](https://github.com/pranavgk/AgenticWIT/issues/17) | Real-time UI Updates | Frontend | - |

### Phase 3: Advanced Features
| Issue | Task | Primary Agent | Supporting Agent(s) |
|-------|------|---------------|---------------------|
| [#18](https://github.com/pranavgk/AgenticWIT/issues/18) | Sprint Backend Services | Backend | Database |
| [#19](https://github.com/pranavgk/AgenticWIT/issues/19) | Sprint Planning UI | Frontend | - |
| [#20](https://github.com/pranavgk/AgenticWIT/issues/20) | Analytics Backend | Backend | Database |
| [#21](https://github.com/pranavgk/AgenticWIT/issues/21) | Analytics Dashboard | Frontend | - |
| [#22](https://github.com/pranavgk/AgenticWIT/issues/22) | Search Implementation | Backend | Infrastructure |
| [#23](https://github.com/pranavgk/AgenticWIT/issues/23) | Notification System | Backend | Frontend |
| [#24](https://github.com/pranavgk/AgenticWIT/issues/24) | File Upload Service | Backend | Infrastructure, Security |
| [#25](https://github.com/pranavgk/AgenticWIT/issues/25) | Wiki Foundation | Frontend | Backend |

### Phase 4: Polish & Launch
| Issue | Task | Primary Agent | Supporting Agent(s) |
|-------|------|---------------|---------------------|
| [#26](https://github.com/pranavgk/AgenticWIT/issues/26) | Backend Performance Optimization | Backend | Database |
| [#27](https://github.com/pranavgk/AgenticWIT/issues/27) | Frontend Performance Optimization | Frontend | Infrastructure |
| [#28](https://github.com/pranavgk/AgenticWIT/issues/28) | Load Testing | Testing | Infrastructure |
| [#29](https://github.com/pranavgk/AgenticWIT/issues/29) | Security Assessment & Hardening | Security | Testing |
| [#30](https://github.com/pranavgk/AgenticWIT/issues/30) | Accessibility Compliance Audit | Testing | Frontend |
| [#31](https://github.com/pranavgk/AgenticWIT/issues/31) | Complete Documentation | Documentation | - |
| [#32](https://github.com/pranavgk/AgenticWIT/issues/32) | Pre-launch Validation | Coordinator | Verification, All Agents |
| [#33](https://github.com/pranavgk/AgenticWIT/issues/33) | Production Launch | Coordinator | Infrastructure |

## Using Agent HQ in VS Code

### Method 1: Direct Issue Reference
```
@workspace Fix issue #5
```
Agent HQ will:
1. Read issue #5 from GitHub
2. See labels: `agent:backend`, `agent:security`
3. Load Backend Agent and Security Agent contexts
4. Execute the task with appropriate expertise

### Method 2: Explicit Agent Mention
```
@infrastructure-agent Set up Azure infrastructure per issue #1
```
This directly invokes the Infrastructure Agent with the issue context.

### Method 3: Workspace Context
```
@workspace I want to work on authentication
```
Agent HQ will:
1. Search for authentication-related issues
2. Find #5 (Authentication & User Service)
3. Route to Backend and Security agents

## Agent Context Files

Each agent has a dedicated file in `.github/agents/` that defines:
- **Role & Responsibilities**: What the agent specializes in
- **Key Focus Areas**: Technologies and patterns they use
- **Success Criteria**: Quality standards they must meet

Agent HQ automatically loads these contexts when routing work.

## Verification Flow

**Every task goes through the Verification Agent** before completion:
1. Primary agent(s) complete the work
2. Verification Agent validates outputs against criteria
3. If validation fails, work returns to primary agent
4. If validation passes, issue can be closed

## Tips for Effective Agent Assignment

### ✅ Do This
- Use `@workspace` and let Agent HQ auto-route based on labels
- Reference issue numbers to provide full context
- Trust the agent labels - they're carefully assigned
- Let Verification Agent review before closing issues

### ❌ Avoid This
- Don't manually copy-paste between agents
- Don't close issues without verification
- Don't override agent expertise areas
- Don't skip the verification step

## Example Workflow

```markdown
1. You: "@workspace Start work on issue #1"
   
2. Agent HQ: 
   - Detects label: agent:infrastructure
   - Loads Infrastructure Agent context
   - Reads issue requirements
   
3. Infrastructure Agent:
   - Creates Terraform configurations
   - Provisions Azure resources
   - Documents setup process
   
4. You: "@verification-agent Review the infrastructure setup"
   
5. Verification Agent:
   - Validates Terraform syntax
   - Checks resource configurations
   - Verifies documentation
   - ✅ Approves or ❌ Requests changes
   
6. You close issue #1 after verification passes
```

## Advanced: Cross-Agent Collaboration

For complex tasks requiring multiple agents:

```markdown
You: "@workspace Work on issue #14 - Work Item Creation & Editing UI"

Agent HQ orchestrates:
1. Frontend Agent - Creates UI components
2. Backend Agent - Builds API endpoints
3. Verification Agent - Validates integration
4. Testing Agent - Runs accessibility tests
```

The agents coordinate automatically through Agent HQ!

---

## Quick Reference Commands

| Command | Effect |
|---------|--------|
| `@workspace Fix issue #N` | Auto-route to appropriate agent(s) |
| `@agent-name Do task X` | Direct agent invocation |
| `@verification-agent Review` | Validate completed work |
| `@coordinator-agent Plan` | Plan multi-step work |

---

**Remember**: The agent labels on GitHub issues are the source of truth for routing. Agent HQ reads these labels and automatically selects the right specialized agent for each task! 🤖
