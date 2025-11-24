# Project Service

The Project Service provides comprehensive project management functionality with team support and fine-grained permissions.

## Features

- **Project CRUD Operations**: Create, read, update, and delete projects
- **Team Management**: Add/remove members with role-based access control
- **Permissions System**: Owner, Admin, Member, and Viewer roles
- **Search & Filtering**: Search projects by name, key, description with filters
- **Accessibility Support**: WCAG compliance levels (A, AA, AAA)
- **Public/Private Projects**: Control project visibility
- **Audit Logging**: Track all project operations

## API Endpoints

### Projects

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "key": "MYPROJ",
  "description": "Project description",
  "isPublic": false,
  "accessibilityLevel": "AA",
  "highContrastMode": false,
  "screenReaderOptimized": true
}
```

#### Get Project
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PATCH /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": true
}
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

#### Search Projects
```http
GET /api/projects?query=search&isPublic=true&page=1&limit=20
Authorization: Bearer <token>
```

### Project Members

#### Add Member
```http
POST /api/projects/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "role": "member"
}
```

#### Get Members
```http
GET /api/projects/:id/members
Authorization: Bearer <token>
```

#### Update Member Role
```http
PATCH /api/projects/:id/members/:memberId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### Remove Member
```http
DELETE /api/projects/:id/members/:memberId
Authorization: Bearer <token>
```

## Permissions

### Role-Based Access Control

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View | ✓ | ✓ | ✓ | ✓ |
| Edit | ✓ | ✓ | ✓ | ✗ |
| Delete | ✓ | ✗ | ✗ | ✗ |
| Manage Members | ✓ | ✓ | ✗ | ✗ |

### Access Rules

1. **Owner**: Creator of the project, has full control
2. **Admin**: Can edit project and manage members, cannot delete
3. **Member**: Can view and edit project details, cannot manage members
4. **Viewer**: Can only view project details
5. **Public Projects**: Any authenticated user gets viewer access

## Data Model

### Project
```typescript
{
  id: string;
  name: string;
  key: string;                    // Unique identifier (e.g., "PROJ")
  description: string | null;
  isPublic: boolean;
  isArchived: boolean;
  accessibilityLevel: 'A' | 'AA' | 'AAA';
  highContrastMode: boolean;
  screenReaderOptimized: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ProjectMember
```typescript
{
  id: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}
```

## Validation Rules

### Project Key
- Must be 2-10 characters
- Must start with an uppercase letter
- Can only contain uppercase letters and numbers
- Examples: `PROJ`, `TEST123`, `API`

### Project Name
- Must be 3-100 characters
- Can contain any characters

### Description
- Maximum 1000 characters
- Optional field

## Accessibility Features

The project service includes built-in support for accessibility:

- **WCAG Levels**: Projects can specify compliance level (A, AA, AAA)
- **High Contrast Mode**: Flag for projects requiring high contrast
- **Screen Reader Optimization**: Indicates if project is optimized for screen readers

These metadata help teams track accessibility requirements across projects.

## Examples

### Creating a Public Project
```typescript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Open Source Project',
    key: 'OSP',
    description: 'A public open source project',
    isPublic: true,
    accessibilityLevel: 'AA',
  }),
});
```

### Adding Team Members
```typescript
// Add an admin
await fetch(`/api/projects/${projectId}/members`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'admin-user-id',
    role: 'admin',
  }),
});

// Add a member
await fetch(`/api/projects/${projectId}/members`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'member-user-id',
    role: 'member',
  }),
});
```

### Searching Projects
```typescript
const response = await fetch(
  '/api/projects?' + new URLSearchParams({
    query: 'design',
    isArchived: 'false',
    page: '1',
    limit: '20',
  }),
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);
```

## Error Handling

The service returns standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found

Error responses include detailed messages:
```json
{
  "success": false,
  "error": "Permission denied"
}
```

## Testing

The project service includes comprehensive tests:

- **31 unit tests** for type validation
- **40+ integration tests** covering all endpoints
- Tests for permissions and access control
- Tests for error cases and validation

Run tests:
```bash
npm test tests/services/project
npm test tests/integration/project
```

## Architecture

The project service follows a layered architecture:

1. **Routes Layer** (`project.routes.ts`): HTTP routing with Swagger docs
2. **Controller Layer** (`project.controller.ts`): Request/response handling
3. **Service Layer** (`project.service.ts`): Business logic and permissions
4. **Types Layer** (`project.types.ts`): Validation schemas and types
5. **Data Layer**: Prisma ORM for database access

## Security

- All endpoints require authentication
- JWT token validation on every request
- Permission checks before any operation
- Input validation using Zod schemas
- SQL injection protection via Prisma
- Audit logging for all operations

## Performance

- Indexed database fields for fast queries
- Pagination support for large result sets
- Efficient permission checks
- Optimized database queries with Prisma

## Future Enhancements

Potential improvements for future releases:

- [ ] Project templates
- [ ] Project categories/tags
- [ ] Project activity feed
- [ ] Project analytics
- [ ] Bulk operations
- [ ] Advanced search with full-text indexing
- [ ] Project cloning
- [ ] Custom fields
