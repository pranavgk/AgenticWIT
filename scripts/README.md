# GitHub Issues Creation Script

This script creates GitHub issues from the implementation plan with proper sequencing, dependencies, and agent assignments.

## Prerequisites

1. **GitHub Personal Access Token** with `repo` permissions
   - Go to: https://github.com/settings/tokens/new
   - Select scope: `repo` (Full control of private repositories)
   - Generate token and save it

2. **Set Environment Variable**
   ```powershell
   $env:GITHUB_TOKEN = "your_token_here"
   ```

## Usage

### 1. Dry Run (Preview)
Preview what issues would be created without actually creating them:
```powershell
.\scripts\create-github-issues.ps1 -DryRun
```

### 2. Create Issues
Create all issues in GitHub:
```powershell
.\scripts\create-github-issues.ps1
```

### 3. Custom Repository (optional)
```powershell
.\scripts\create-github-issues.ps1 -Owner "username" -Repo "repository"
```

## What It Creates

### Labels
- **Agent Labels**: `agent:coordinator`, `agent:verification`, `agent:infrastructure`, etc.
- **Phase Labels**: `phase:1-foundation`, `phase:2-core`, `phase:3-advanced`, `phase:4-launch`
- **Priority Labels**: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- **Type Labels**: `type:infrastructure`, `type:feature`, `type:testing`, `type:documentation`, `type:security`

### Issues (33 Total)
- **Phase 1 - Foundation** (7 issues): Infrastructure, CI/CD, database, auth, testing, docs
- **Phase 2 - Core Features** (10 issues): Projects, work items, frontend, real-time
- **Phase 3 - Advanced Features** (8 issues): Sprints, analytics, search, notifications, files, wiki
- **Phase 4 - Polish & Launch** (8 issues): Performance, security, accessibility, docs, launch

## Issue Structure

Each issue includes:
- **Title**: Clear, concise task name
- **Description**: Detailed task breakdown with sub-tasks
- **Verification Checklist**: Quality gates for completion
- **Deliverables**: Expected file structure
- **Dependencies**: Links to prerequisite tasks
- **Labels**: Agent, phase, priority, type

## Sequencing

Issues are created in sequence order (1-33) with dependencies clearly marked. Work should follow this order:

1. Start with Phase 1 tasks (critical infrastructure)
2. Phase 2 tasks depend on Phase 1 completion
3. Phase 3 builds on Phase 2
4. Phase 4 requires all features complete

## Agent Assignments

Use labels to filter issues by agent:
- `agent:infrastructure` - DevOps and cloud setup
- `agent:backend` - API and services
- `agent:frontend` - UI and UX
- `agent:database` - Schema and queries
- `agent:testing` - QA and accessibility
- `agent:security` - Security and compliance
- `agent:documentation` - Docs and guides
- `agent:coordinator` - Planning and coordination
- `agent:verification` - Quality validation

## After Creation

1. **Review Issues**: https://github.com/pranavgk/AgenticWIT/issues
2. **Create Project Board**: Organize issues into columns (To Do, In Progress, Done)
3. **Assign Agents**: Tag appropriate team members/agents
4. **Start Phase 1**: Begin with infrastructure setup tasks

## Notes

- Issues include dependency information but GitHub doesn't enforce this natively
- Consider using a project management tool or GitHub Projects for dependency tracking
- The Verification Agent should validate completion of each issue before marking as done
- Critical path items are marked with `priority:critical`
