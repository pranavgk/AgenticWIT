# AgenticWIT System Architecture

## Overview

AgenticWIT is an enterprise work item tracking system built with a modern, scalable architecture that prioritizes accessibility, security, and performance.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js 14 Frontend (React + TypeScript)                          │
│  - Server-side rendering                                             │
│  - Accessibility-first design (WCAG 2.1 AA)                         │
│  - Radix UI components                                               │
│  - TanStack Query for server state                                   │
│  - Zustand for client state                                          │
└────────────────────┬────────────────────────────────────────────────┘
                     │ HTTPS
                     │ (Azure Front Door CDN)
                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                              │
├─────────────────────────────────────────────────────────────────────┤
│  Azure Front Door Premium                                           │
│  - Global load balancing                                             │
│  - WAF (Web Application Firewall)                                    │
│  - DDoS protection                                                   │
│  - SSL/TLS termination                                               │
│  - CDN for static assets                                             │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend Service Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│  Fastify API Server (Node.js + TypeScript)                         │
│                                                                      │
│  Services:                                                           │
│  ├─ Authentication Service (JWT + bcrypt)                           │
│  ├─ User Service (Profile management)                               │
│  ├─ Project Service (Coming soon)                                   │
│  ├─ Work Item Service (Coming soon)                                 │
│  └─ WebSocket Service (Real-time updates)                           │
│                                                                      │
│  Middleware:                                                         │
│  ├─ Authentication (JWT verification)                                │
│  ├─ Rate Limiting (@fastify/rate-limit)                             │
│  ├─ CORS (@fastify/cors)                                             │
│  ├─ Security Headers (Helmet)                                        │
│  └─ Request Validation (Zod schemas)                                 │
└────────────┬────────────────────┬──────────────────────────────────┘
             │                    │
             ↓                    ↓
┌────────────────────┐  ┌───────────────────────┐
│   Data Layer       │  │   Cache Layer         │
├────────────────────┤  ├───────────────────────┤
│ PostgreSQL 15      │  │ Redis 7               │
│ - User data        │  │ - Session cache       │
│ - Work items       │  │ - Rate limit data     │
│ - Projects         │  │ - Token blacklist     │
│ - Audit logs       │  │ - WebSocket state     │
│                    │  │                       │
│ Prisma ORM         │  │ ioredis client        │
│ - Type safety      │  │ - Clustering support  │
│ - Migrations       │  │ - Pub/Sub for WS      │
│ - Query builder    │  │                       │
└────────────────────┘  └───────────────────────┘
```

## Component Details

### Frontend Layer

**Technology**: Next.js 14 with React 18
**Hosting**: Azure Static Web Apps / Azure Front Door CDN

Features:
- **Server-Side Rendering (SSR)**: Improved SEO and initial page load
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- **Component Library**: Radix UI for accessible, unstyled components
- **Styling**: Tailwind CSS with custom accessibility-focused theme
- **State Management**:
  - Server state: TanStack Query (React Query)
  - Client state: Zustand
- **Real-time**: WebSocket client for live updates

### API Gateway Layer

**Technology**: Azure Front Door Premium

Features:
- Global load balancing across multiple regions
- Web Application Firewall (WAF) with OWASP rules
- DDoS protection
- SSL/TLS certificate management
- Static asset CDN with edge caching
- Request routing and URL rewriting
- Health probes and automatic failover

### Backend Service Layer

**Technology**: Fastify 4 with TypeScript 5

**Current Services**:

1. **Authentication Service**
   - JWT-based authentication
   - bcrypt password hashing (12 salt rounds)
   - Token refresh with rotation
   - MFA support (database ready)
   - Audit logging

2. **User Service**
   - User registration and profile management
   - Accessibility preferences
   - Password management
   - Account status management

**Planned Services**:
- Project Service (task organization)
- Work Item Service (epics, features, stories, tasks, bugs)
- Sprint Service (agile planning)
- Comment Service (collaboration)
- File Service (attachments)
- Notification Service (real-time alerts)
- Analytics Service (reporting and insights)
- Search Service (Elasticsearch integration)

**Middleware Stack**:
```typescript
Request → Rate Limiting → CORS → Helmet → JWT Auth → Route Handler
```

### Data Layer

**Primary Database**: PostgreSQL 15 (Azure Database for PostgreSQL Flexible Server)

**Schema Design**:
```
User
├─ id (UUID, primary key)
├─ email (unique, indexed)
├─ username (unique, indexed)
├─ password (bcrypt hashed)
├─ firstName, lastName, displayName
├─ mfaEnabled, mfaSecret
├─ accountStatus (active, suspended, deleted)
├─ accessibilityPreferences (JSON)
├─ lastLoginAt, lastLoginIp
└─ createdAt, updatedAt

RefreshToken
├─ id (UUID, primary key)
├─ token (unique, indexed)
├─ userId (foreign key → User.id, cascade delete)
├─ expiresAt
└─ createdAt

AuditLog
├─ id (UUID, primary key)
├─ userId (foreign key → User.id, set null on delete)
├─ action (register, login, logout, password_change, etc.)
├─ resource (user, workitem, project, etc.)
├─ details (JSON)
├─ ipAddress
├─ userAgent
└─ createdAt (indexed)
```

**ORM**: Prisma 5
- Type-safe database client
- Schema migrations
- Query optimization
- Connection pooling

### Cache Layer

**Technology**: Redis 7 (Azure Cache for Redis Premium)

**Use Cases**:
1. **Session Management**: Store active user sessions
2. **Rate Limiting**: Track API request counts per user/IP
3. **Token Blacklist**: Invalidated JWT tokens
4. **WebSocket State**: Track connected clients
5. **Pub/Sub**: Real-time event distribution
6. **Query Caching**: Frequently accessed data

**Configuration**:
- Clustering for high availability
- Persistence for critical data (token blacklist)
- TTL-based automatic expiration

## Data Flow

### Authentication Flow

```
1. User Registration
   Client → POST /api/auth/register
   ├─ Validate input (Zod schema)
   ├─ Check email/username uniqueness
   ├─ Hash password (bcrypt, 12 rounds)
   ├─ Create user in PostgreSQL
   ├─ Generate JWT access token (15 min)
   ├─ Generate refresh token (7 days)
   ├─ Store refresh token in PostgreSQL
   ├─ Log audit event
   └─ Return tokens + user data

2. User Login
   Client → POST /api/auth/login
   ├─ Validate input
   ├─ Find user by email
   ├─ Verify password (bcrypt compare)
   ├─ Generate new JWT access token
   ├─ Generate new refresh token
   ├─ Invalidate old refresh tokens
   ├─ Log audit event
   └─ Return tokens + user data

3. Token Refresh
   Client → POST /api/auth/refresh
   ├─ Validate refresh token
   ├─ Find token in PostgreSQL
   ├─ Check expiration
   ├─ Generate new JWT access token
   ├─ Generate new refresh token (rotation)
   ├─ Delete old refresh token
   └─ Return new tokens

4. Protected Request
   Client → GET /api/users/me (with Bearer token)
   ├─ Extract JWT from Authorization header
   ├─ Verify JWT signature
   ├─ Check expiration
   ├─ Decode user ID from token
   ├─ Fetch user from PostgreSQL
   ├─ Execute request handler
   └─ Return response
```

### Real-Time Update Flow (Future)

```
User Action → Backend Service
├─ Process request
├─ Update database
├─ Publish event to Redis Pub/Sub
├─ Redis broadcasts to all backend instances
└─ Each instance notifies connected WebSocket clients
    └─ Frontend updates UI in real-time
```

## Security Architecture

### Authentication & Authorization

1. **JWT Tokens**
   - Access token: 15-minute expiry (short-lived)
   - Refresh token: 7-day expiry (long-lived, stored in DB)
   - Token rotation on refresh
   - Signature verification on every request

2. **Password Security**
   - bcrypt hashing with 12 salt rounds
   - Password complexity requirements
   - Rate limiting on login/registration

3. **Session Management**
   - Refresh tokens stored in database
   - Logout invalidates refresh token
   - Automatic cleanup of expired tokens

### API Security

1. **Rate Limiting**
   - Per endpoint configuration
   - IP-based and user-based limiting
   - Registration: 5 requests/15 min
   - Login: 10 requests/15 min
   - Password change: 5 requests/15 min
   - General API: 100 requests/15 min

2. **Request Validation**
   - Zod schemas for type safety
   - Input sanitization
   - SQL injection prevention (Prisma ORM)
   - XSS prevention (output escaping)

3. **Security Headers**
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

4. **CORS**
   - Whitelist of allowed origins
   - Credentials support
   - Preflight caching

### Infrastructure Security

1. **Azure Front Door WAF**
   - OWASP Top 10 protection
   - Custom rule sets
   - Geo-filtering
   - Bot protection

2. **Network Isolation**
   - Private endpoints for databases
   - VNet integration
   - Network security groups

3. **Secrets Management**
   - Azure Key Vault
   - Environment-based configuration
   - No secrets in code

### Audit & Monitoring

1. **Audit Logging**
   - All authentication events
   - Data modifications
   - Access attempts
   - User actions with context (IP, user agent)

2. **Application Monitoring**
   - Azure Application Insights
   - Performance metrics
   - Error tracking
   - Distributed tracing

## Scalability Architecture

### Horizontal Scaling

1. **Backend Services**
   - Stateless design
   - Load balanced via Azure Front Door
   - Auto-scaling based on CPU/memory
   - Multiple regions for global performance

2. **Database**
   - PostgreSQL read replicas (3 replicas)
   - Connection pooling (Prisma)
   - Query optimization and indexing

3. **Cache**
   - Redis clustering (3 shards)
   - In-memory performance
   - Pub/Sub for real-time

### Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - CDN for static assets
   - Service worker caching

2. **Backend**
   - Response compression
   - Query result caching
   - Database query optimization
   - Async processing

3. **Database**
   - Proper indexing
   - Query plan analysis
   - Connection pooling
   - Read/write splitting

## Deployment Architecture

### Environments

1. **Development**
   - Local Docker containers
   - PostgreSQL + Redis locally
   - Hot reload enabled
   - Debug logging

2. **Staging**
   - Azure-hosted
   - Production-like configuration
   - Integration testing
   - Performance testing

3. **Production**
   - Multi-region deployment
   - Auto-scaling enabled
   - Health monitoring
   - Automated backups

### CI/CD Pipeline

```
Code Push → GitHub
├─ Lint & Type Check
├─ Run Tests (Unit + Integration + E2E)
├─ Build Docker Image
├─ Security Scan (Trivy)
├─ Push to Azure Container Registry
└─ Deploy via ArgoCD (GitOps)
    ├─ Rolling deployment
    ├─ Health checks
    └─ Automatic rollback on failure
```

## Accessibility Architecture

### WCAG 2.1 AA Compliance

1. **Perceivable**
   - Alt text for images
   - Video captions
   - Color contrast (4.5:1 minimum)
   - Text resize support

2. **Operable**
   - Keyboard navigation
   - Focus indicators
   - No keyboard traps
   - Sufficient time for tasks

3. **Understandable**
   - Clear labels
   - Error identification
   - Consistent navigation
   - Help documentation

4. **Robust**
   - Semantic HTML
   - ARIA labels
   - Screen reader compatibility
   - Progressive enhancement

### Accessibility Features

1. **User Preferences**
   - Theme selection (light/dark/high-contrast)
   - Font size adjustment
   - Reduced motion option
   - Screen reader mode
   - Keyboard-only navigation mode

2. **Component Design**
   - Radix UI (accessible by default)
   - Focus management
   - Keyboard shortcuts
   - Skip links

3. **Testing**
   - Automated: axe-core in E2E tests
   - Manual: Screen reader testing
   - Continuous: Accessibility CI checks

## Future Architecture Enhancements

1. **Microservices**: Split monolith into domain services
2. **Event Sourcing**: Full audit trail with event replay
3. **GraphQL**: Flexible data fetching alongside REST
4. **Machine Learning**: AI-powered work estimation
5. **Offline Support**: Progressive Web App with sync
6. **Mobile Apps**: Native iOS/Android clients

---

**Last Updated**: November 24, 2025
**Version**: 0.1.0
