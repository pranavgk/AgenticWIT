# Backend API Agent Instructions

## Agent Identity
**Name**: Backend API Agent  
**Role**: Server-side Application Developer  
**Primary Goal**: Build robust, scalable, and secure backend services for the enterprise work tracking system

## Core Responsibilities

### 1. Microservices Architecture
- **Service Design**: Domain-driven microservices architecture
- **API Development**: GraphQL and REST API implementation
- **Inter-service Communication**: Event-driven architecture with message queues
- **Data Consistency**: Distributed transaction management

### 2. Core Services Implementation
- **User Service**: Authentication, authorization, user management
- **Project Service**: Project creation, team management, permissions
- **Work Item Service**: Work items, hierarchy, relationships, workflows
- **Sprint Service**: Sprint planning, capacity, velocity tracking
- **Notification Service**: Real-time notifications, email alerts
- **Analytics Service**: Reporting, metrics, dashboards
- **File Service**: Attachments, document management
- **Integration Service**: External tool integrations

### 3. Database Integration
- **ORM Implementation**: Prisma with PostgreSQL
- **Query Optimization**: Efficient database queries and indexing
- **Caching Strategy**: Redis-based caching layers
- **Data Validation**: Comprehensive input validation and sanitization

## Detailed Task Breakdown

### Foundation Services

#### Task 1.1: Project Structure Setup
```
backend/
├── src/
│   ├── services/
│   │   ├── user/
│   │   ├── project/
│   │   ├── workitem/
│   │   ├── sprint/
│   │   ├── notification/
│   │   ├── analytics/
│   │   ├── file/
│   │   └── integration/
│   ├── shared/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── types/
│   │   └── constants/
│   ├── graphql/
│   │   ├── schemas/
│   │   ├── resolvers/
│   │   └── directives/
│   └── rest/
│       ├── routes/
│       ├── controllers/
│       └── middleware/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── docs/
    ├── api/
    └── architecture/
```

#### Task 1.2: Core Infrastructure
```typescript
// src/shared/types/common.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PaginationInput {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterInput {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like';
  value: any;
}

// src/shared/middleware/auth.ts
export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    // JWT token validation
    // User session management
    // Permission checking
  }
}

// src/shared/utils/validation.ts
export class ValidationService {
  static validateWorkItem(data: CreateWorkItemInput): ValidationResult {
    // Zod schema validation
    // Business rule validation
    // Security checks
  }
}
```

#### Task 1.3: Database Schema Design
```prisma
// prisma/schema.prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  firstName   String
  lastName    String
  avatar      String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  createdProjects Project[] @relation("CreatedByUser")
  assignedWorkItems WorkItem[] @relation("AssignedToUser")
  projectMembers ProjectMember[]
  comments Comment[]
  
  @@map("users")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  key         String   @unique
  avatar      String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String
  
  // Relations
  creator     User @relation("CreatedByUser", fields: [createdBy], references: [id])
  workItems   WorkItem[]
  sprints     Sprint[]
  members     ProjectMember[]
  
  @@map("projects")
}

model WorkItem {
  id          String     @id @default(cuid())
  title       String
  description String?
  type        WorkItemType
  status      WorkItemStatus
  priority    Priority
  storyPoints Int?
  assigneeId  String?
  projectId   String
  parentId    String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  createdBy   String
  
  // Relations
  project     Project @relation(fields: [projectId], references: [id])
  assignee    User? @relation("AssignedToUser", fields: [assigneeId], references: [id])
  parent      WorkItem? @relation("WorkItemHierarchy", fields: [parentId], references: [id])
  children    WorkItem[] @relation("WorkItemHierarchy")
  comments    Comment[]
  attachments Attachment[]
  
  @@map("work_items")
}

enum WorkItemType {
  EPIC
  FEATURE
  USER_STORY
  TASK
  BUG
  TECHNICAL_DEBT
}

enum WorkItemStatus {
  NEW
  ACTIVE
  RESOLVED
  CLOSED
  REMOVED
}

enum Priority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}
```

### Service Implementation

#### Task 2.1: User Service
```typescript
// src/services/user/user.service.ts
export class UserService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private logger: Logger
  ) {}

  async createUser(data: CreateUserInput): Promise<User> {
    // Validate input
    // Check for existing user
    // Hash password
    // Create user record
    // Send welcome email
    // Cache user data
  }

  async authenticateUser(credentials: LoginInput): Promise<AuthResult> {
    // Validate credentials
    // Verify password
    // Generate JWT tokens
    // Update last login
    // Return tokens and user data
  }

  async updateUserProfile(userId: string, data: UpdateUserInput): Promise<User> {
    // Authorize update
    // Validate changes
    // Update database
    // Invalidate cache
    // Audit log
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    // Check cache first
    // Query user projects with permissions
    // Apply security filters
    // Cache results
  }
}

// src/services/user/user.resolver.ts
@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.userService.getCurrentUser(user.id);
  }

  @Mutation(() => AuthResult)
  async login(@Args('input') input: LoginInput): Promise<AuthResult> {
    return this.userService.authenticateUser(input);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateUserInput
  ): Promise<User> {
    return this.userService.updateUserProfile(user.id, input);
  }
}
```

#### Task 2.2: Work Item Service
```typescript
// src/services/workitem/workitem.service.ts
export class WorkItemService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private eventBus: EventBus,
    private logger: Logger
  ) {}

  async createWorkItem(data: CreateWorkItemInput, userId: string): Promise<WorkItem> {
    // Validate permissions
    // Validate hierarchy rules
    // Generate work item key
    // Create database record
    // Publish creation event
    // Update search index
    // Cache work item
  }

  async updateWorkItem(
    workItemId: string,
    data: UpdateWorkItemInput,
    userId: string
  ): Promise<WorkItem> {
    // Check permissions
    // Validate state transitions
    // Update database
    // Create audit entry
    // Publish update event
    // Invalidate cache
    // Update search index
  }

  async getWorkItemHierarchy(workItemId: string): Promise<WorkItemTree> {
    // Check cache
    // Build hierarchy tree
    // Apply security filters
    // Cache result
  }

  async searchWorkItems(
    projectId: string,
    criteria: SearchCriteria
  ): Promise<PaginatedWorkItems> {
    // Use Elasticsearch for complex searches
    // Apply filters and sorting
    // Paginate results
    // Enhance with cached data
  }

  async moveWorkItem(
    workItemId: string,
    newParentId: string,
    userId: string
  ): Promise<WorkItem> {
    // Validate move operation
    // Check for circular references
    // Update hierarchy
    // Recalculate rollups
    // Publish move event
  }
}
```

#### Task 2.3: Project Service
```typescript
// src/services/project/project.service.ts
export class ProjectService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private fileService: FileService,
    private logger: Logger
  ) {}

  async createProject(data: CreateProjectInput, userId: string): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      // Create project
      const project = await tx.project.create({
        data: {
          ...data,
          createdBy: userId,
        },
      });

      // Add creator as admin
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          role: ProjectRole.ADMIN,
          addedBy: userId,
        },
      });

      // Create default work item types
      await this.createDefaultWorkItemTypes(tx, project.id);

      // Publish project created event
      await this.eventBus.publish('project.created', project);

      return project;
    });
  }

  async addProjectMember(
    projectId: string,
    memberData: AddMemberInput,
    addedBy: string
  ): Promise<ProjectMember> {
    // Validate permissions
    // Check user exists
    // Add member to project
    // Send invitation email
    // Publish member added event
  }

  async getProjectDashboard(
    projectId: string,
    userId: string
  ): Promise<ProjectDashboard> {
    // Check project access
    // Get project statistics
    // Get recent activities
    // Get team velocity
    // Get burndown data
  }
}
```

### Real-time Features

#### Task 3.1: WebSocket Server
```typescript
// src/websocket/socket.server.ts
export class SocketServer {
  private io: Server;
  private redis: Redis;

  constructor() {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
    });
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // JWT authentication middleware
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      // Verify JWT token
      // Attach user to socket
      next();
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      // Join project rooms
      socket.on('join-project', (projectId) => {
        socket.join(`project:${projectId}`);
      });

      // Handle work item updates
      socket.on('workitem-update', async (data) => {
        // Broadcast to project members
        socket.to(`project:${data.projectId}`).emit('workitem-updated', data);
      });

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        socket.to(`project:${data.projectId}`).emit('user-typing', {
          userId: socket.user.id,
          workItemId: data.workItemId,
        });
      });
    });
  }
}
```

#### Task 3.2: Event System
```typescript
// src/shared/events/event-bus.ts
export class EventBus {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  async publish(eventType: string, data: any): Promise<void> {
    await this.producer.send({
      topic: 'work-tracker-events',
      messages: [{
        key: eventType,
        value: JSON.stringify({
          type: eventType,
          data,
          timestamp: new Date().toISOString(),
        }),
      }],
    });
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    // Subscribe to specific event types
    // Route to appropriate handlers
    // Handle retries and dead letter queues
  }
}

// Event handlers
export const workItemEventHandlers = {
  'workitem.created': async (event: WorkItemCreatedEvent) => {
    // Update search index
    // Send notifications
    // Update analytics
  },
  
  'workitem.updated': async (event: WorkItemUpdatedEvent) => {
    // Broadcast real-time updates
    // Update caches
    // Trigger automation rules
  },
  
  'workitem.status-changed': async (event: WorkItemStatusChangedEvent) => {
    // Update sprint burndown
    // Trigger workflow actions
    // Send status change notifications
  },
};
```

### Integration & Optimization

#### Task 4.1: API Performance Optimization
```typescript
// src/shared/middleware/caching.ts
export class CachingMiddleware {
  static cache(ttl: number = 300) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.generateCacheKey(req);
      const cached = await redis.get(key);
      
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        redis.setex(key, ttl, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    };
  }
}

// Query optimization with DataLoader
export class WorkItemDataLoader {
  private batchWorkItems = new DataLoader(
    async (ids: string[]) => {
      const workItems = await this.prisma.workItem.findMany({
        where: { id: { in: ids } },
        include: {
          assignee: true,
          project: true,
          parent: true,
        },
      });
      
      return ids.map(id => workItems.find(item => item.id === id));
    }
  );

  async loadWorkItem(id: string): Promise<WorkItem> {
    return this.batchWorkItems.load(id);
  }
}
```

#### Task 4.2: Security Implementation
```typescript
// src/shared/middleware/security.ts
export class SecurityMiddleware {
  static rateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  static validateInput() {
    return (schema: ZodSchema) => {
      return (req: Request, res: Response, next: NextFunction) => {
        try {
          schema.parse(req.body);
          next();
        } catch (error) {
          res.status(400).json({ error: 'Invalid input data' });
        }
      };
    };
  }

  static sanitizeOutput() {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json;
      res.json = function(data) {
        // Remove sensitive fields
        const sanitized = sanitizeObject(data, ['password', 'token', 'secret']);
        return originalJson.call(this, sanitized);
      };
      next();
    };
  }
}
```

## API Documentation

### GraphQL Schema
```graphql
# Core types
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  avatar: String
  isActive: Boolean!
  createdAt: DateTime!
  projects: [Project!]!
  assignedWorkItems: [WorkItem!]!
}

type Project {
  id: ID!
  name: String!
  description: String
  key: String!
  avatar: String
  isActive: Boolean!
  createdAt: DateTime!
  members: [ProjectMember!]!
  workItems: [WorkItem!]!
  sprints: [Sprint!]!
}

type WorkItem {
  id: ID!
  title: String!
  description: String
  type: WorkItemType!
  status: WorkItemStatus!
  priority: Priority!
  storyPoints: Int
  assignee: User
  project: Project!
  parent: WorkItem
  children: [WorkItem!]!
  comments: [Comment!]!
  attachments: [Attachment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Mutations
type Mutation {
  # User operations
  login(input: LoginInput!): AuthResult!
  register(input: RegisterInput!): AuthResult!
  updateProfile(input: UpdateUserInput!): User!
  
  # Project operations
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  addProjectMember(projectId: ID!, input: AddMemberInput!): ProjectMember!
  
  # Work item operations
  createWorkItem(input: CreateWorkItemInput!): WorkItem!
  updateWorkItem(id: ID!, input: UpdateWorkItemInput!): WorkItem!
  moveWorkItem(id: ID!, parentId: ID): WorkItem!
  deleteWorkItem(id: ID!): Boolean!
}

# Queries
type Query {
  # User queries
  me: User!
  user(id: ID!): User
  
  # Project queries
  project(id: ID!): Project
  projects(input: ProjectsInput): ProjectConnection!
  
  # Work item queries
  workItem(id: ID!): WorkItem
  workItems(input: WorkItemsInput): WorkItemConnection!
  searchWorkItems(input: SearchInput!): SearchResults!
}

# Subscriptions for real-time updates
type Subscription {
  workItemUpdated(projectId: ID!): WorkItem!
  projectMemberAdded(projectId: ID!): ProjectMember!
  notificationReceived(userId: ID!): Notification!
}
```

### REST API Endpoints
```yaml
# Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout

# Projects
GET /api/projects
POST /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
GET /api/projects/:id/dashboard
GET /api/projects/:id/members
POST /api/projects/:id/members

# Work Items
GET /api/projects/:projectId/workitems
POST /api/projects/:projectId/workitems
GET /api/workitems/:id
PUT /api/workitems/:id
DELETE /api/workitems/:id
GET /api/workitems/:id/history
POST /api/workitems/:id/comments

# Search & Analytics
GET /api/search/workitems
GET /api/analytics/velocity
GET /api/analytics/burndown
GET /api/reports/workitem-summary
```

## Quality Assurance

### Testing Strategy
```typescript
// Unit tests
describe('WorkItemService', () => {
  let service: WorkItemService;
  let mockPrisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    mockPrisma = mockDeep<PrismaClient>();
    service = new WorkItemService(mockPrisma, mockRedis, mockEventBus);
  });

  it('should create work item with valid data', async () => {
    const input = { title: 'Test Item', type: 'TASK' };
    mockPrisma.workItem.create.mockResolvedValue(mockWorkItem);
    
    const result = await service.createWorkItem(input, 'user-id');
    
    expect(result).toEqual(mockWorkItem);
    expect(mockPrisma.workItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining(input),
    });
  });
});

// Integration tests
describe('WorkItem API', () => {
  it('should create work item via REST API', async () => {
    const response = await request(app)
      .post('/api/projects/proj-1/workitems')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Test Item', type: 'TASK' })
      .expect(201);
    
    expect(response.body.title).toBe('Test Item');
  });
});
```

### Microsoft Accessibility API Requirements

#### 1. Accessibility Metadata APIs
```typescript
// User accessibility preferences
interface AccessibilityPreferences {
  id: string
  userId: string
  highContrast: boolean
  reducedMotion: boolean
  screenReaderType: 'nvda' | 'jaws' | 'narrator' | 'voiceover' | 'none'
  fontSize: 'small' | 'medium' | 'large' | 'xl'
  keyboardNavigation: boolean
  alternativeText: boolean
  colorBlindnessType?: 'protanopia' | 'deuteranopia' | 'tritanopia'
  createdAt: DateTime
  updatedAt: DateTime
}

// Alternative text for media content
interface AlternativeText {
  id: string
  contentId: string
  contentType: 'image' | 'video' | 'audio' | 'document'
  altText: string
  description?: string
  language: string
  createdAt: DateTime
  updatedAt: DateTime
}

// Caption data for multimedia
interface Caption {
  id: string
  mediaId: string
  language: string
  format: 'srt' | 'vtt' | 'ttml'
  content: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. REST API Endpoints
```typescript
// Accessibility preferences
GET /api/users/:id/accessibility-preferences
PUT /api/users/:id/accessibility-preferences
POST /api/users/:id/accessibility-preferences

// Alternative text management
POST /api/content/alternative-text
PUT /api/content/:contentId/alternative-text
GET /api/content/:contentId/alternative-text
DELETE /api/content/:contentId/alternative-text

// Caption management
POST /api/media/:mediaId/captions
GET /api/media/:mediaId/captions/:language?
PUT /api/media/:mediaId/captions/:language
DELETE /api/media/:mediaId/captions/:language

// Accessibility validation
POST /api/content/validate-accessibility
GET /api/accessibility/compliance-report
```

#### 3. GraphQL Schema Extensions
```graphql
type AccessibilityPreferences {
  id: ID!
  userId: ID!
  highContrast: Boolean!
  reducedMotion: Boolean!
  screenReaderType: ScreenReaderType!
  fontSize: FontSize!
  keyboardNavigation: Boolean!
  alternativeText: Boolean!
  colorBlindnessType: ColorBlindnessType
}

type AlternativeText {
  id: ID!
  contentId: ID!
  contentType: ContentType!
  altText: String!
  description: String
  language: String!
}

type Mutation {
  updateAccessibilityPreferences(
    input: AccessibilityPreferencesInput!
  ): AccessibilityPreferences!
  
  addAlternativeText(
    input: AlternativeTextInput!
  ): AlternativeText!
  
  validateContentAccessibility(
    contentId: ID!
  ): AccessibilityValidationResult!
}
```

#### 4. Service Implementation
```typescript
// src/services/accessibility/accessibility.service.ts
export class AccessibilityService {
  async getUserPreferences(userId: string): Promise<AccessibilityPreferences> {
    return this.prisma.accessibilityPreferences.findUnique({
      where: { userId },
    })
  }

  async updateUserPreferences(
    userId: string,
    preferences: AccessibilityPreferencesInput
  ): Promise<AccessibilityPreferences> {
    return this.prisma.accessibilityPreferences.upsert({
      where: { userId },
      update: preferences,
      create: { userId, ...preferences },
    })
  }

  async addAlternativeText(data: AlternativeTextInput): Promise<AlternativeText> {
    // Validate content exists
    // Generate AI-powered alt text if not provided
    // Store alternative text
    return this.prisma.alternativeText.create({ data })
  }

  async validateAccessibility(contentId: string): Promise<AccessibilityValidationResult> {
    // Check for alternative text
    // Validate color contrast ratios
    // Check heading structure
    // Validate ARIA attributes
    // Return compliance report
  }
}
```

### Performance Requirements
- **Response Time**: < 200ms for CRUD operations
- **Throughput**: 1000 requests/second per service
- **Concurrency**: Handle 10,000 concurrent connections
- **Database**: < 50ms query response times
- **Accessibility APIs**: < 100ms for preference retrieval

## Dependencies

### From Other Agents
- **Infrastructure Agent**: Database connections, Redis cache, monitoring
- **Database Agent**: Schema design, migrations, optimization queries
- **Security Agent**: Authentication policies, security middleware
- **Frontend Agent**: API contract requirements, real-time event needs

### Provides to Other Agents
- **API Specifications**: OpenAPI specs for REST and GraphQL schemas
- **Real-time Events**: WebSocket events and message formats
- **Database Models**: Entity relationships and data structures
- **Integration Endpoints**: External API integration capabilities

## Success Metrics

### Technical Metrics
- **API Response Time**: P95 < 200ms, P99 < 500ms
- **Throughput**: 50,000 requests per minute
- **Error Rate**: < 0.1% for all endpoints
- **Code Coverage**: > 90% unit test coverage
- **Security**: Zero critical vulnerabilities

### Functional Metrics
- **Feature Completeness**: 100% of specified features implemented
- **Data Integrity**: Zero data corruption incidents
- **Real-time Performance**: < 100ms message delivery
- **Integration Success**: All external integrations working
- **Documentation**: Complete API documentation with examples

---

*The Backend API Agent delivers the core server-side functionality that powers the entire work tracking system, ensuring scalability, security, and performance.*