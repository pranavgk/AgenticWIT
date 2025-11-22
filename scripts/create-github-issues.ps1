# GitHub Issues Creation Script for AgenticWIT
# This script creates GitHub issues from the implementation plan with proper sequencing

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = $env:GITHUB_TOKEN,
    
    [Parameter(Mandatory=$false)]
    [string]$Owner = "pranavgk",
    
    [Parameter(Mandatory=$false)]
    [string]$Repo = "AgenticWIT",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Check for GitHub token
if (-not $GitHubToken) {
    Write-Error "GitHub token not found. Set GITHUB_TOKEN environment variable or pass -GitHubToken parameter"
    exit 1
}

$apiBase = "https://api.github.com"
$headers = @{
    "Authorization" = "Bearer $GitHubToken"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# Define agent labels
$agentLabels = @{
    "coordinator" = "agent:coordinator"
    "verification" = "agent:verification"
    "infrastructure" = "agent:infrastructure"
    "database" = "agent:database"
    "backend" = "agent:backend"
    "frontend" = "agent:frontend"
    "testing" = "agent:testing"
    "security" = "agent:security"
    "documentation" = "agent:documentation"
}

# Define phase labels
$phaseLabels = @{
    1 = "phase:1-foundation"
    2 = "phase:2-core"
    3 = "phase:3-advanced"
    4 = "phase:4-launch"
}

# Function to create a label if it doesn't exist
function Ensure-Label {
    param($name, $color, $description)
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would create label: $name" -ForegroundColor Cyan
        return
    }
    
    try {
        $labelUrl = "$apiBase/repos/$Owner/$Repo/labels/$name"
        Invoke-RestMethod -Uri $labelUrl -Headers $headers -Method Get | Out-Null
        Write-Host "Label exists: $name" -ForegroundColor Green
    }
    catch {
        try {
            $body = @{
                name = $name
                color = $color
                description = $description
            } | ConvertTo-Json
            
            $createUrl = "$apiBase/repos/$Owner/$Repo/labels"
            Invoke-RestMethod -Uri $createUrl -Headers $headers -Method Post -Body $body -ContentType "application/json" | Out-Null
            Write-Host "Created label: $name" -ForegroundColor Yellow
        }
        catch {
            Write-Warning "Failed to create label $name : $_"
        }
    }
}

# Create all necessary labels
Write-Host "`n=== Creating Labels ===" -ForegroundColor Magenta

# Agent labels
Ensure-Label "agent:coordinator" "7057ff" "Coordinator Agent"
Ensure-Label "agent:verification" "d73a4a" "Verification Agent"
Ensure-Label "agent:infrastructure" "0075ca" "Infrastructure Agent"
Ensure-Label "agent:database" "cfd3d7" "Database Agent"
Ensure-Label "agent:backend" "a2eeef" "Backend Agent"
Ensure-Label "agent:frontend" "7057ff" "Frontend Agent"
Ensure-Label "agent:testing" "d876e3" "Testing Agent"
Ensure-Label "agent:security" "b60205" "Security Agent"
Ensure-Label "agent:documentation" "0e8a16" "Documentation Agent"

# Phase labels
Ensure-Label "phase:1-foundation" "fbca04" "Phase 1: Foundation"
Ensure-Label "phase:2-core" "d4c5f9" "Phase 2: Core Features"
Ensure-Label "phase:3-advanced" "c2e0c6" "Phase 3: Advanced Features"
Ensure-Label "phase:4-launch" "f9d0c4" "Phase 4: Polish & Launch"

# Priority labels
Ensure-Label "priority:critical" "b60205" "Critical priority - blocking"
Ensure-Label "priority:high" "d93f0b" "High priority"
Ensure-Label "priority:medium" "fbca04" "Medium priority"
Ensure-Label "priority:low" "0e8a16" "Low priority"

# Type labels
Ensure-Label "type:infrastructure" "0052cc" "Infrastructure setup"
Ensure-Label "type:feature" "a2eeef" "New feature"
Ensure-Label "type:testing" "d876e3" "Testing task"
Ensure-Label "type:documentation" "0e8a16" "Documentation"
Ensure-Label "type:security" "b60205" "Security related"

Write-Host "`n=== Creating Issues ===" -ForegroundColor Magenta

# Define all tasks with dependencies
$tasks = @(
    # Phase 1: Foundation
    @{
        title = "Azure Infrastructure Provisioning"
        body = @"
## Objective
Set up core Azure infrastructure for the AgenticWIT platform.

## Tasks
- [ ] Create Azure resource groups (dev, staging, prod)
- [ ] Set up Virtual Networks with subnet configuration
- [ ] Provision Azure Kubernetes Service (AKS) clusters
  - System node pool: 3 nodes (Standard_D4s_v3)
  - Application node pool: 3 nodes (Standard_D8s_v3)
- [ ] Configure Azure Container Registry (ACR)
- [ ] Set up Azure Key Vault for secrets management
- [ ] Configure managed identities for services

## Verification Checklist
- [ ] Terraform plan executes without errors
- [ ] All resources provisioned successfully
- [ ] Network connectivity verified between subnets
- [ ] Managed identities have correct permissions
- [ ] Cost estimates within budget

## Deliverables
``````
infrastructure/
├── terraform/
│   ├── modules/
│   │   ├── networking/
│   │   ├── aks/
│   │   ├── acr/
│   │   └── keyvault/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── main.tf
└── docs/
    └── infrastructure-setup.md
``````
"@
        labels = @("agent:infrastructure", "phase:1-foundation", "priority:critical", "type:infrastructure")
        phase = 1
        sequence = 1
        dependencies = @()
    },
    
    @{
        title = "CI/CD Pipeline Setup"
        body = @"
## Objective
Configure continuous integration and deployment pipelines.

## Tasks
- [ ] Configure GitHub Actions workflows
  - Build pipeline (lint, test, build, scan)
  - Deploy pipeline (helm, rollout strategy)
- [ ] Set up ArgoCD for GitOps
- [ ] Configure automated testing in pipeline
- [ ] Set up container image scanning (Trivy)
- [ ] Configure deployment to AKS via Helm

## Verification Checklist
- [ ] Sample application deploys successfully
- [ ] Pipeline runs end-to-end without errors
- [ ] Container scanning catches vulnerabilities
- [ ] ArgoCD syncs successfully
- [ ] Rollback mechanism tested

## Deliverables
``````
.github/workflows/
├── build.yml
├── deploy-dev.yml
├── deploy-staging.yml
└── deploy-prod.yml
argocd/
├── applications/
└── projects/
``````

## Dependencies
Requires: Azure Infrastructure Provisioning
"@
        labels = @("agent:infrastructure", "phase:1-foundation", "priority:critical", "type:infrastructure")
        phase = 1
        sequence = 2
        dependencies = @("Azure Infrastructure Provisioning")
    },
    
    @{
        title = "Azure Front Door CDN Setup"
        body = @"
## Objective
Set up global content delivery network with security features.

## Tasks
- [ ] Provision Azure Front Door Premium
- [ ] Configure global endpoints and origin groups
- [ ] Set up SSL/TLS certificates (managed)
- [ ] Configure WAF with OWASP rules
- [ ] Set up Azure Blob Storage for static assets
- [ ] Configure CDN caching policies
- [ ] Enable DDoS protection

## Verification Checklist
- [ ] CDN endpoints accessible globally
- [ ] SSL/TLS certificates valid
- [ ] WAF rules active and tested
- [ ] Static asset caching working
- [ ] Performance benchmarks met (< 50ms for cached content)

## Deliverables
``````
infrastructure/terraform/modules/cdn/
├── frontdoor.tf
├── waf.tf
├── storage.tf
└── variables.tf
``````

## Dependencies
Requires: Azure Infrastructure Provisioning
"@
        labels = @("agent:infrastructure", "phase:1-foundation", "priority:high", "type:infrastructure")
        phase = 1
        sequence = 3
        dependencies = @("Azure Infrastructure Provisioning")
    },
    
    @{
        title = "Database Infrastructure Setup"
        body = @"
## Objective
Provision database infrastructure and design initial schema.

## Tasks

### Infrastructure Agent
- [ ] Provision Azure Database for PostgreSQL Flexible Server
  - General Purpose, 16 vCores, 2 TB storage
- [ ] Set up read replicas (3 replicas)
- [ ] Configure backup policies (35 days, geo-redundant)
- [ ] Provision Azure Cache for Redis Premium (P3)
- [ ] Set up Redis clustering (3 shards)
- [ ] Configure private endpoints for databases

### Database Agent
- [ ] Design initial schema for core entities
- [ ] Create database migration framework setup
- [ ] Implement user preferences table with accessibility fields
- [ ] Create audit logging tables
- [ ] Set up database monitoring and alerts

## Verification Checklist
- [ ] Database connections working via private endpoint
- [ ] Migrations run successfully
- [ ] Schema matches specification
- [ ] Backups configured and tested
- [ ] Redis cache connectivity verified
- [ ] Performance benchmarks met

## Deliverables
``````
database/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_accessibility_preferences.sql
│   └── 003_audit_tables.sql
├── seeds/
│   └── dev_data.sql
└── docs/
    └── schema-design.md
``````

## Dependencies
Requires: Azure Infrastructure Provisioning
"@
        labels = @("agent:infrastructure", "agent:database", "phase:1-foundation", "priority:critical", "type:infrastructure")
        phase = 1
        sequence = 4
        dependencies = @("Azure Infrastructure Provisioning")
    },
    
    @{
        title = "Authentication & User Service"
        body = @"
## Objective
Implement secure authentication and user management services.

## Tasks

### Backend Agent
- [ ] Set up Node.js/TypeScript project structure
- [ ] Configure Fastify framework with plugins
- [ ] Implement JWT authentication service
- [ ] Create user registration endpoint
- [ ] Create user login endpoint with MFA support
- [ ] Implement password hashing (bcrypt)
- [ ] Create user profile endpoints
- [ ] Set up Prisma ORM with PostgreSQL

### Security Agent
- [ ] Implement JWT token generation/validation
- [ ] Configure token refresh mechanism
- [ ] Set up rate limiting for auth endpoints
- [ ] Implement password complexity validation
- [ ] Configure CORS policies
- [ ] Set up security headers (helmet)
- [ ] Implement API key authentication for service-to-service

## Verification Checklist
- [ ] All endpoints return correct response codes
- [ ] JWT tokens validate correctly
- [ ] Password hashing verified (cannot reverse)
- [ ] Rate limiting blocks excessive requests
- [ ] Security headers present in all responses
- [ ] No hardcoded secrets in code
- [ ] Unit tests passing (>80% coverage)

## Deliverables
``````
backend/
├── src/
│   ├── services/user/
│   ├── middleware/
│   ├── utils/
│   └── app.ts
├── tests/
└── prisma/schema.prisma
``````

## Dependencies
Requires: Database Infrastructure Setup, CI/CD Pipeline Setup
"@
        labels = @("agent:backend", "agent:security", "phase:1-foundation", "priority:critical", "type:feature", "type:security")
        phase = 1
        sequence = 5
        dependencies = @("Database Infrastructure Setup", "CI/CD Pipeline Setup")
    },
    
    @{
        title = "Testing Framework Setup"
        body = @"
## Objective
Establish comprehensive testing infrastructure.

## Tasks
- [ ] Configure Jest for unit testing
- [ ] Set up Supertest for API integration tests
- [ ] Configure Playwright for E2E tests
- [ ] Set up test databases with Docker
- [ ] Create test data factories
- [ ] Configure code coverage reporting
- [ ] Set up Microsoft Accessibility Insights integration
- [ ] Configure axe-core for automated accessibility testing

## Verification Checklist
- [ ] Sample tests run successfully
- [ ] Test coverage reports generated
- [ ] E2E tests can run in CI/CD
- [ ] Accessibility tests integrated
- [ ] Test documentation complete

## Deliverables
``````
tests/
├── unit/
├── integration/
├── e2e/
├── accessibility/
├── fixtures/
└── setup/
``````

## Dependencies
Requires: CI/CD Pipeline Setup
"@
        labels = @("agent:testing", "phase:1-foundation", "priority:high", "type:testing")
        phase = 1
        sequence = 6
        dependencies = @("CI/CD Pipeline Setup")
    },
    
    @{
        title = "Documentation Framework"
        body = @"
## Objective
Set up documentation infrastructure and create initial guides.

## Tasks
- [ ] Set up API documentation with OpenAPI/Swagger
- [ ] Create architecture diagrams
- [ ] Write developer setup guide
- [ ] Create API usage examples
- [ ] Set up automated API docs generation
- [ ] Create accessibility guidelines document
- [ ] Write contribution guidelines

## Verification Checklist
- [ ] API docs accessible and accurate
- [ ] Setup guide tested on fresh environment
- [ ] All code examples compile and run
- [ ] Diagrams match actual architecture
- [ ] Accessibility guidelines comprehensive

## Deliverables
``````
docs/
├── api/
├── architecture/
├── guides/
└── examples/
``````

## Dependencies
Requires: CI/CD Pipeline Setup
"@
        labels = @("agent:documentation", "phase:1-foundation", "priority:medium", "type:documentation")
        phase = 1
        sequence = 7
        dependencies = @("CI/CD Pipeline Setup")
    },
    
    # Phase 2: Core Features
    @{
        title = "Project Service Implementation"
        body = @"
## Objective
Build project management service with team support.

## Tasks

### Database Agent
- [ ] Design project schema with accessibility metadata
- [ ] Create project-related migrations
- [ ] Design team membership schema
- [ ] Create indexes for performance

### Backend Agent
- [ ] Implement project creation API
- [ ] Implement project retrieval/update/delete APIs
- [ ] Create team membership management
- [ ] Implement project permissions
- [ ] Add project search functionality
- [ ] Create GraphQL schema for projects

## Verification Checklist
- [ ] All CRUD operations working
- [ ] Permissions enforced correctly
- [ ] GraphQL queries optimized
- [ ] API response times < 200ms
- [ ] Unit tests >80% coverage
- [ ] Integration tests passing

## Deliverables
``````
backend/src/services/project/
└── tests/project/
``````

## Dependencies
Requires: Authentication & User Service, Testing Framework Setup
"@
        labels = @("agent:backend", "agent:database", "phase:2-core", "priority:critical", "type:feature")
        phase = 2
        sequence = 8
        dependencies = @("Authentication & User Service", "Testing Framework Setup")
    },
    
    @{
        title = "Work Item Service Foundation"
        body = @"
## Objective
Create work item management system with hierarchy support.

## Tasks

### Database Agent
- [ ] Design work item schema (epics, features, stories, tasks, bugs)
- [ ] Create hierarchy relationships
- [ ] Design accessibility impact tracking
- [ ] Create work item migrations

### Backend Agent
- [ ] Implement work item creation API
- [ ] Implement work item CRUD operations
- [ ] Create work item hierarchy management
- [ ] Implement work item assignment
- [ ] Add work item status transitions

## Verification Checklist
- [ ] Work item types created correctly
- [ ] Hierarchy relationships working
- [ ] Status transitions validated
- [ ] Accessibility fields present
- [ ] Performance benchmarks met

## Deliverables
``````
backend/src/services/workitem/
``````

## Dependencies
Requires: Project Service Implementation
"@
        labels = @("agent:backend", "agent:database", "phase:2-core", "priority:critical", "type:feature")
        phase = 2
        sequence = 9
        dependencies = @("Project Service Implementation")
    },
    
    @{
        title = "Frontend Project Setup"
        body = @"
## Objective
Initialize frontend application with proper tooling.

## Tasks

### Frontend Agent
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up Radix UI components
- [ ] Configure Zustand for state management
- [ ] Set up React Query for server state
- [ ] Configure ESLint and Prettier
- [ ] Set up accessibility testing with axe-core

### Infrastructure Agent
- [ ] Configure frontend build pipeline
- [ ] Set up preview deployments for PRs
- [ ] Configure CDN deployment for static assets

## Verification Checklist
- [ ] Development server runs without errors
- [ ] Build completes successfully
- [ ] Linting passes
- [ ] TypeScript compilation successful
- [ ] Accessibility tools configured

## Deliverables
``````
frontend/
├── app/
├── components/
├── lib/
├── hooks/
├── store/
└── styles/
``````

## Dependencies
Requires: CI/CD Pipeline Setup, Azure Front Door CDN Setup
"@
        labels = @("agent:frontend", "agent:infrastructure", "phase:2-core", "priority:critical", "type:infrastructure")
        phase = 2
        sequence = 10
        dependencies = @("CI/CD Pipeline Setup", "Azure Front Door CDN Setup")
    },
    
    @{
        title = "Core UI Components & Accessibility"
        body = @"
## Objective
Build accessible, reusable UI component library.

## Tasks

### Frontend Agent
- [ ] Create base UI components (Button, Input, Card, etc.)
- [ ] Implement accessible form components
- [ ] Create layout components (Header, Sidebar, Navigation)
- [ ] Implement theme system (light/dark/high-contrast)
- [ ] Create loading and error states
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles

### Testing Agent
- [ ] Write accessibility tests for components
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Validate WCAG 2.1 AA compliance
- [ ] Test high contrast mode

## Verification Checklist
- [ ] All components render without errors
- [ ] Keyboard navigation works completely
- [ ] Screen reader announces correctly
- [ ] High contrast mode working
- [ ] axe-core reports zero violations
- [ ] Component tests passing

## Deliverables
``````
frontend/components/
├── ui/
├── layout/
└── feedback/
tests/components/
``````

## Dependencies
Requires: Frontend Project Setup, Testing Framework Setup
"@
        labels = @("agent:frontend", "agent:testing", "phase:2-core", "priority:critical", "type:feature")
        phase = 2
        sequence = 11
        dependencies = @("Frontend Project Setup", "Testing Framework Setup")
    },
    
    @{
        title = "Authentication Pages & User Management UI"
        body = @"
## Objective
Build authentication flows and user management interface.

## Tasks

### Frontend Agent
- [ ] Create login page with accessibility
- [ ] Create registration page
- [ ] Create password reset flow
- [ ] Implement MFA setup UI
- [ ] Create user profile page
- [ ] Implement session management
- [ ] Create accessibility preferences UI

### Security Agent
- [ ] Review authentication flow security
- [ ] Validate input sanitization
- [ ] Test CSRF protection
- [ ] Verify secure session handling

## Verification Checklist
- [ ] Login flow works end-to-end
- [ ] Registration validates inputs
- [ ] Password reset secure
- [ ] MFA working correctly
- [ ] Accessibility preferences saved
- [ ] No XSS vulnerabilities
- [ ] E2E tests passing

## Deliverables
``````
frontend/app/(auth)/
frontend/components/auth/
``````

## Dependencies
Requires: Core UI Components & Accessibility, Authentication & User Service
"@
        labels = @("agent:frontend", "agent:security", "phase:2-core", "priority:critical", "type:feature", "type:security")
        phase = 2
        sequence = 12
        dependencies = @("Core UI Components & Accessibility", "Authentication & User Service")
    },
    
    @{
        title = "User Dashboard & Navigation"
        body = @"
## Objective
Create main dashboard and navigation system.

## Tasks
- [ ] Create main dashboard layout
- [ ] Implement responsive navigation
- [ ] Create user menu with settings
- [ ] Implement notification bell
- [ ] Create search functionality
- [ ] Add keyboard shortcuts
- [ ] Implement breadcrumb navigation

## Verification Checklist
- [ ] Dashboard loads quickly (< 2s)
- [ ] Navigation accessible via keyboard
- [ ] Responsive on mobile devices
- [ ] Search works correctly
- [ ] Keyboard shortcuts functional
- [ ] Performance benchmarks met

## Deliverables
``````
frontend/app/(dashboard)/
``````

## Dependencies
Requires: Authentication Pages & User Management UI
"@
        labels = @("agent:frontend", "phase:2-core", "priority:high", "type:feature")
        phase = 2
        sequence = 13
        dependencies = @("Authentication Pages & User Management UI")
    },
    
    @{
        title = "Work Item Creation & Editing UI"
        body = @"
## Objective
Build work item management interface.

## Tasks

### Frontend Agent
- [ ] Create work item form component
- [ ] Implement work item type selection
- [ ] Create rich text editor for descriptions
- [ ] Implement file attachment UI
- [ ] Create work item detail page
- [ ] Add inline editing capability
- [ ] Implement accessibility impact selection

### Backend Agent
- [ ] Add file upload endpoint
- [ ] Implement work item search API
- [ ] Create work item activity feed
- [ ] Add comment functionality

## Verification Checklist
- [ ] Form validation working
- [ ] Rich text editor accessible
- [ ] File uploads successful
- [ ] Detail page loads quickly
- [ ] Inline editing saves correctly
- [ ] Accessibility features verified

## Deliverables
``````
frontend/app/(dashboard)/work-items/
backend/src/services/workitem/
``````

## Dependencies
Requires: Work Item Service Foundation, User Dashboard & Navigation
"@
        labels = @("agent:frontend", "agent:backend", "phase:2-core", "priority:critical", "type:feature")
        phase = 2
        sequence = 14
        dependencies = @("Work Item Service Foundation", "User Dashboard & Navigation")
    },
    
    @{
        title = "Kanban Board with Accessibility"
        body = @"
## Objective
Create accessible kanban board for work item management.

## Tasks

### Frontend Agent
- [ ] Create kanban board component
- [ ] Implement drag-and-drop (mouse)
- [ ] Implement keyboard drag-and-drop
- [ ] Create column management
- [ ] Add filters and grouping
- [ ] Implement virtual scrolling for performance
- [ ] Add screen reader announcements

### Testing Agent
- [ ] Test drag-and-drop with keyboard
- [ ] Validate screen reader announcements
- [ ] Test with different assistive technologies
- [ ] Performance test with large datasets

## Verification Checklist
- [ ] Drag-and-drop works with mouse
- [ ] Keyboard drag-and-drop functional
- [ ] Screen reader announces moves
- [ ] Performance good with 1000+ items
- [ ] Accessibility compliance verified
- [ ] E2E tests passing

## Deliverables
``````
frontend/components/kanban/
tests/e2e/kanban.spec.ts
``````

## Dependencies
Requires: Work Item Creation & Editing UI
"@
        labels = @("agent:frontend", "agent:testing", "phase:2-core", "priority:high", "type:feature")
        phase = 2
        sequence = 15
        dependencies = @("Work Item Creation & Editing UI")
    },
    
    @{
        title = "WebSocket Infrastructure"
        body = @"
## Objective
Set up real-time communication infrastructure.

## Tasks

### Backend Agent
- [ ] Set up Socket.IO server
- [ ] Configure Redis adapter for clustering
- [ ] Implement room-based messaging
- [ ] Create connection authentication
- [ ] Implement presence detection
- [ ] Add typing indicators
- [ ] Create notification broadcasting

### Infrastructure Agent
- [ ] Configure load balancing for WebSocket
- [ ] Set up Redis for Socket.IO adapter
- [ ] Configure sticky sessions
- [ ] Monitor WebSocket connections

## Verification Checklist
- [ ] WebSocket connections stable
- [ ] Messages delivered reliably
- [ ] Authentication working
- [ ] Clustering functional
- [ ] Performance acceptable (< 100ms delivery)
- [ ] Connection handling tested

## Deliverables
``````
backend/src/websocket/
``````

## Dependencies
Requires: Database Infrastructure Setup, Authentication & User Service
"@
        labels = @("agent:backend", "agent:infrastructure", "phase:2-core", "priority:high", "type:feature", "type:infrastructure")
        phase = 2
        sequence = 16
        dependencies = @("Database Infrastructure Setup", "Authentication & User Service")
    },
    
    @{
        title = "Real-time UI Updates"
        body = @"
## Objective
Implement real-time updates in frontend.

## Tasks
- [ ] Implement WebSocket client
- [ ] Create real-time work item updates
- [ ] Add live activity feed
- [ ] Implement typing indicators
- [ ] Add presence indicators
- [ ] Create notification system
- [ ] Handle reconnection logic

## Verification Checklist
- [ ] Real-time updates working
- [ ] Notifications displayed correctly
- [ ] Reconnection handles gracefully
- [ ] No memory leaks
- [ ] Accessibility maintained during updates
- [ ] Performance impact minimal

## Deliverables
``````
frontend/lib/websocket-client.ts
frontend/components/activity-feed.tsx
``````

## Dependencies
Requires: WebSocket Infrastructure, Kanban Board with Accessibility
"@
        labels = @("agent:frontend", "phase:2-core", "priority:high", "type:feature")
        phase = 2
        sequence = 17
        dependencies = @("WebSocket Infrastructure", "Kanban Board with Accessibility")
    },
    
    # Phase 3: Advanced Features
    @{
        title = "Sprint Backend Services"
        body = @"
## Objective
Implement sprint planning and management backend.

## Tasks

### Database Agent
- [ ] Design sprint schema
- [ ] Create sprint-work item relationships
- [ ] Design capacity and velocity tracking
- [ ] Create burndown data schema

### Backend Agent
- [ ] Implement sprint CRUD APIs
- [ ] Create sprint planning APIs
- [ ] Implement capacity management
- [ ] Add velocity calculation
- [ ] Create burndown chart data API
- [ ] Implement sprint retrospective

## Verification Checklist
- [ ] Sprint operations working
- [ ] Capacity calculations correct
- [ ] Velocity tracking accurate
- [ ] API performance acceptable
- [ ] Tests passing

## Dependencies
Requires: Work Item Service Foundation
"@
        labels = @("agent:backend", "agent:database", "phase:3-advanced", "priority:high", "type:feature")
        phase = 3
        sequence = 18
        dependencies = @("Work Item Service Foundation")
    },
    
    @{
        title = "Sprint Planning UI"
        body = @"
## Objective
Build sprint planning and management interface.

## Tasks
- [ ] Create sprint planning page
- [ ] Implement backlog management
- [ ] Create capacity planning UI
- [ ] Implement sprint board view
- [ ] Create burndown chart
- [ ] Add velocity visualization
- [ ] Implement accessibility for charts

## Verification Checklist
- [ ] Sprint planning workflow smooth
- [ ] Charts accessible
- [ ] Drag-and-drop working
- [ ] Data visualization clear
- [ ] Performance acceptable

## Dependencies
Requires: Sprint Backend Services, Real-time UI Updates
"@
        labels = @("agent:frontend", "phase:3-advanced", "priority:high", "type:feature")
        phase = 3
        sequence = 19
        dependencies = @("Sprint Backend Services", "Real-time UI Updates")
    },
    
    @{
        title = "Analytics Backend"
        body = @"
## Objective
Build analytics and reporting backend.

## Tasks
- [ ] Design analytics data schema
- [ ] Create data aggregation queries
- [ ] Implement reporting APIs
- [ ] Add custom report builder
- [ ] Create export functionality
- [ ] Implement caching for reports

## Verification Checklist
- [ ] Queries optimized
- [ ] Report generation fast
- [ ] Export formats working
- [ ] Cache effective

## Dependencies
Requires: Work Item Service Foundation, Sprint Backend Services
"@
        labels = @("agent:backend", "agent:database", "phase:3-advanced", "priority:medium", "type:feature")
        phase = 3
        sequence = 20
        dependencies = @("Work Item Service Foundation", "Sprint Backend Services")
    },
    
    @{
        title = "Analytics Dashboard"
        body = @"
## Objective
Create analytics and reporting interface.

## Tasks
- [ ] Create analytics dashboard
- [ ] Implement various chart types
- [ ] Add filtering and date ranges
- [ ] Create custom report builder UI
- [ ] Implement export functionality
- [ ] Ensure charts are accessible

## Verification Checklist
- [ ] Dashboard loads quickly
- [ ] Charts accessible
- [ ] Filters working
- [ ] Exports successful

## Dependencies
Requires: Analytics Backend
"@
        labels = @("agent:frontend", "phase:3-advanced", "priority:medium", "type:feature")
        phase = 3
        sequence = 21
        dependencies = @("Analytics Backend")
    },
    
    @{
        title = "Search Implementation"
        body = @"
## Objective
Implement full-text search functionality.

## Tasks

### Backend Agent
- [ ] Set up Elasticsearch integration
- [ ] Implement full-text search
- [ ] Create search indexing service
- [ ] Add advanced filtering
- [ ] Implement search suggestions

### Infrastructure Agent
- [ ] Provision Elasticsearch cluster
- [ ] Configure search indexes
- [ ] Set up index maintenance

## Verification Checklist
- [ ] Search returns relevant results
- [ ] Search performance < 300ms
- [ ] Indexing working correctly
- [ ] Suggestions helpful

## Dependencies
Requires: Work Item Service Foundation, Database Infrastructure Setup
"@
        labels = @("agent:backend", "agent:infrastructure", "phase:3-advanced", "priority:high", "type:feature", "type:infrastructure")
        phase = 3
        sequence = 22
        dependencies = @("Work Item Service Foundation", "Database Infrastructure Setup")
    },
    
    @{
        title = "Notification System"
        body = @"
## Objective
Build comprehensive notification system.

## Tasks

### Backend Agent
- [ ] Implement notification service
- [ ] Create email notification templates
- [ ] Add notification preferences
- [ ] Implement notification delivery

### Frontend Agent
- [ ] Create notification center UI
- [ ] Implement notification preferences UI
- [ ] Add notification sounds (optional)
- [ ] Create notification accessibility

## Verification Checklist
- [ ] Notifications delivered reliably
- [ ] Email templates accessible
- [ ] Preferences saved correctly
- [ ] UI accessible to screen readers

## Dependencies
Requires: WebSocket Infrastructure, User Dashboard & Navigation
"@
        labels = @("agent:backend", "agent:frontend", "phase:3-advanced", "priority:medium", "type:feature")
        phase = 3
        sequence = 23
        dependencies = @("WebSocket Infrastructure", "User Dashboard & Navigation")
    },
    
    @{
        title = "File Upload Service"
        body = @"
## Objective
Implement secure file management system.

## Tasks

### Backend Agent
- [ ] Implement file upload API
- [ ] Create file metadata management
- [ ] Add virus scanning integration
- [ ] Implement file download
- [ ] Create thumbnail generation

### Infrastructure Agent
- [ ] Configure Azure Blob Storage
- [ ] Set up CDN for file delivery
- [ ] Configure storage policies

### Security Agent
- [ ] Implement file type validation
- [ ] Add virus scanning
- [ ] Configure access controls
- [ ] Test file upload security

## Verification Checklist
- [ ] Uploads working for all file types
- [ ] Virus scanning effective
- [ ] Downloads fast via CDN
- [ ] Thumbnails generated correctly
- [ ] Security controls verified

## Dependencies
Requires: Azure Front Door CDN Setup, Authentication & User Service
"@
        labels = @("agent:backend", "agent:infrastructure", "agent:security", "phase:3-advanced", "priority:medium", "type:feature", "type:security")
        phase = 3
        sequence = 24
        dependencies = @("Azure Front Door CDN Setup", "Authentication & User Service")
    },
    
    @{
        title = "Wiki Foundation"
        body = @"
## Objective
Build wiki/documentation system.

## Tasks

### Backend Agent
- [ ] Create wiki page schema
- [ ] Implement wiki CRUD APIs
- [ ] Add version control for pages
- [ ] Implement wiki search

### Frontend Agent
- [ ] Create wiki editor
- [ ] Implement wiki navigation
- [ ] Add page versioning UI
- [ ] Create wiki search

## Verification Checklist
- [ ] Wiki editor accessible
- [ ] Versioning working
- [ ] Search functional
- [ ] Performance acceptable

## Dependencies
Requires: Work Item Service Foundation, Search Implementation
"@
        labels = @("agent:backend", "agent:frontend", "phase:3-advanced", "priority:low", "type:feature")
        phase = 3
        sequence = 25
        dependencies = @("Work Item Service Foundation", "Search Implementation")
    },
    
    # Phase 4: Polish & Launch
    @{
        title = "Backend Performance Optimization"
        body = @"
## Objective
Optimize backend performance and resource usage.

## Tasks
- [ ] Optimize database queries
- [ ] Implement query result caching
- [ ] Add database connection pooling
- [ ] Optimize API endpoints
- [ ] Implement response compression
- [ ] Add request batching

## Verification Checklist
- [ ] Query times reduced
- [ ] Cache hit rate > 80%
- [ ] API response times < 200ms
- [ ] Resource usage optimized

## Dependencies
Requires: All Phase 2 and Phase 3 backend tasks
"@
        labels = @("agent:backend", "agent:database", "phase:4-launch", "priority:high", "type:feature")
        phase = 4
        sequence = 26
        dependencies = @("Real-time UI Updates", "Analytics Dashboard", "Wiki Foundation")
    },
    
    @{
        title = "Frontend Performance Optimization"
        body = @"
## Objective
Optimize frontend performance and bundle size.

## Tasks

### Frontend Agent
- [ ] Implement code splitting
- [ ] Add lazy loading for routes
- [ ] Optimize bundle size
- [ ] Implement image optimization
- [ ] Add prefetching for critical paths
- [ ] Optimize rendering performance

### Infrastructure Agent
- [ ] Configure CDN caching policies
- [ ] Optimize asset compression
- [ ] Set up performance monitoring
- [ ] Configure CDN purging

## Verification Checklist
- [ ] Lighthouse score > 90
- [ ] Bundle size < 500KB initial
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] CDN cache hit ratio > 85%

## Dependencies
Requires: All Phase 2 and Phase 3 frontend tasks
"@
        labels = @("agent:frontend", "agent:infrastructure", "phase:4-launch", "priority:high", "type:feature")
        phase = 4
        sequence = 27
        dependencies = @("Real-time UI Updates", "Sprint Planning UI", "Analytics Dashboard")
    },
    
    @{
        title = "Load Testing"
        body = @"
## Objective
Validate system performance under load.

## Tasks
- [ ] Create load testing scenarios
- [ ] Run load tests (10K concurrent users)
- [ ] Stress test critical endpoints
- [ ] Test auto-scaling behavior
- [ ] Identify bottlenecks
- [ ] Document performance characteristics

## Verification Checklist
- [ ] System handles 10K concurrent users
- [ ] Response times stay < 500ms
- [ ] Auto-scaling triggers correctly
- [ ] No memory leaks detected
- [ ] Error rate < 0.1%

## Dependencies
Requires: Backend Performance Optimization, Frontend Performance Optimization
"@
        labels = @("agent:testing", "agent:infrastructure", "phase:4-launch", "priority:critical", "type:testing")
        phase = 4
        sequence = 28
        dependencies = @("Backend Performance Optimization", "Frontend Performance Optimization")
    },
    
    @{
        title = "Security Assessment & Hardening"
        body = @"
## Objective
Comprehensive security review and hardening.

## Tasks
- [ ] Run SAST scans (SonarQube)
- [ ] Run DAST scans (OWASP ZAP)
- [ ] Perform dependency audit
- [ ] Conduct threat modeling review
- [ ] Test authentication/authorization
- [ ] Validate encryption everywhere
- [ ] Test rate limiting
- [ ] Review CORS policies

## Verification Checklist
- [ ] No critical vulnerabilities
- [ ] No high vulnerabilities
- [ ] All dependencies up to date
- [ ] Authentication secure
- [ ] Encryption verified
- [ ] Rate limiting effective

## Dependencies
Requires: All Phase 2 and Phase 3 features complete
"@
        labels = @("agent:security", "agent:testing", "phase:4-launch", "priority:critical", "type:security")
        phase = 4
        sequence = 29
        dependencies = @("Backend Performance Optimization", "Frontend Performance Optimization")
    },
    
    @{
        title = "Accessibility Compliance Audit"
        body = @"
## Objective
Full accessibility compliance validation.

## Tasks
- [ ] Full WCAG 2.1 AA audit
- [ ] Test with multiple screen readers
- [ ] Test keyboard navigation everywhere
- [ ] Test high contrast mode
- [ ] Review accessibility documentation
- [ ] Conduct security compliance check
- [ ] Validate data protection measures

## Verification Checklist
- [ ] WCAG 2.1 AA compliance 100%
- [ ] Screen readers work perfectly
- [ ] Keyboard navigation complete
- [ ] High contrast mode working
- [ ] Compliance requirements met

## Dependencies
Requires: All frontend features complete
"@
        labels = @("agent:testing", "agent:frontend", "phase:4-launch", "priority:critical", "type:testing")
        phase = 4
        sequence = 30
        dependencies = @("Frontend Performance Optimization")
    },
    
    @{
        title = "Complete Documentation"
        body = @"
## Objective
Finalize all documentation for launch.

## Tasks
- [ ] Finalize API documentation
- [ ] Complete user guides
- [ ] Write admin documentation
- [ ] Create troubleshooting guides
- [ ] Document accessibility features
- [ ] Create video tutorials
- [ ] Write deployment guides

## Verification Checklist
- [ ] All APIs documented
- [ ] User guides comprehensive
- [ ] Admin guides complete
- [ ] Examples tested and working
- [ ] Videos clear and helpful

## Dependencies
Requires: All features complete
"@
        labels = @("agent:documentation", "phase:4-launch", "priority:high", "type:documentation")
        phase = 4
        sequence = 31
        dependencies = @("Backend Performance Optimization", "Frontend Performance Optimization")
    },
    
    @{
        title = "Pre-launch Validation"
        body = @"
## Objective
Final validation before production launch.

## Tasks
- [ ] Final security review
- [ ] Final performance testing
- [ ] Final accessibility audit
- [ ] Backup and recovery testing
- [ ] Monitoring and alerting verification
- [ ] Disaster recovery drill
- [ ] Final documentation review

## Verification Checklist
- [ ] All systems operational
- [ ] All tests passing
- [ ] All documentation complete
- [ ] Monitoring configured
- [ ] Backup/recovery tested
- [ ] Team trained

## Dependencies
Requires: All Phase 4 tasks complete
"@
        labels = @("agent:coordinator", "agent:verification", "phase:4-launch", "priority:critical")
        phase = 4
        sequence = 32
        dependencies = @("Load Testing", "Security Assessment & Hardening", "Accessibility Compliance Audit", "Complete Documentation")
    },
    
    @{
        title = "Production Launch"
        body = @"
## Objective
Deploy to production and monitor launch.

## Tasks

### Soft Launch
- [ ] Deploy to production with feature flags
- [ ] Enable for beta users (10% traffic)
- [ ] Monitor system closely
- [ ] Collect feedback
- [ ] Fix critical issues

### Full Launch
- [ ] Gradually increase traffic (25%, 50%, 100%)
- [ ] Monitor all metrics
- [ ] Respond to issues
- [ ] Collect user feedback
- [ ] Document lessons learned

## Success Criteria
- [ ] 99.9% uptime achieved
- [ ] API response times < 200ms (P95)
- [ ] All accessibility standards met
- [ ] Security scans passing
- [ ] User satisfaction > 4.5/5

## Dependencies
Requires: Pre-launch Validation
"@
        labels = @("agent:coordinator", "agent:infrastructure", "phase:4-launch", "priority:critical")
        phase = 4
        sequence = 33
        dependencies = @("Pre-launch Validation")
    }
)

# Function to create an issue
function Create-Issue {
    param($task)
    
    $labels = $task.labels
    
    $body = $task.body
    
    $issueData = @{
        title = $task.title
        body = $body
        labels = $labels
    } | ConvertTo-Json -Depth 10
    
    if ($DryRun) {
        Write-Host "`n[DRY RUN] Would create issue:" -ForegroundColor Cyan
        Write-Host "  Title: $($task.title)" -ForegroundColor White
        Write-Host "  Labels: $($labels -join ', ')" -ForegroundColor Gray
        Write-Host "  Phase: $($task.phase), Sequence: $($task.sequence)" -ForegroundColor Gray
        return @{ number = 0; html_url = "dry-run" }
    }
    
    try {
        $createUrl = "$apiBase/repos/$Owner/$Repo/issues"
        $response = Invoke-RestMethod -Uri $createUrl -Headers $headers -Method Post -Body $issueData -ContentType "application/json"
        Write-Host "Created #$($response.number): $($task.title)" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Error "Failed to create issue '$($task.title)': $_"
        return $null
    }
}

# Create issues in sequence order
$issueMap = @{}
Write-Host "`n=== Creating Issues in Sequence ===" -ForegroundColor Magenta

foreach ($task in ($tasks | Sort-Object sequence)) {
    Start-Sleep -Milliseconds 500  # Rate limiting
    $issue = Create-Issue $task
    if ($issue) {
        $issueMap[$task.title] = $issue
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Magenta
Write-Host "Created $($issueMap.Count) issues" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review issues at: https://github.com/$Owner/$Repo/issues" -ForegroundColor White
Write-Host "2. Create project board to track progress" -ForegroundColor White
Write-Host "3. Assign agents to start work on Phase 1 tasks" -ForegroundColor White
