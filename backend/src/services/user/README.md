# User Authentication Service

This directory contains the complete user authentication implementation for AgenticWIT.

## Structure

```
user/
├── user.types.ts       # Zod schemas and TypeScript types
├── user.service.ts     # Business logic and database operations
├── user.controller.ts  # HTTP request handlers
└── user.routes.ts      # Route configuration
```

## Features

- ✅ User registration with validation
- ✅ Email/password authentication
- ✅ JWT access tokens (15 min expiry)
- ✅ Refresh tokens (7 day expiry)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ User profile management
- ✅ Password change with verification
- ✅ Token refresh mechanism
- ✅ Logout with token invalidation
- ✅ Audit logging for security events
- ✅ MFA support (ready for implementation)
- ✅ Accessibility preferences

## API Endpoints

### Public Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "a1b2c3..."
    }
  }
}
```

#### POST /api/auth/login
Authenticate and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "mfaCode": "123456"  // Optional, required if MFA enabled
}
```

**Response:** Same as registration

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "a1b2c3..."
}
```

**Response:** Same as registration

### Protected Endpoints

All protected endpoints require `Authorization: Bearer {accessToken}` header.

#### GET /api/users/me
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "theme": "light",
    "fontSize": "medium",
    "reduceMotion": false,
    "screenReaderMode": false,
    "keyboardNavOnly": false,
    "isActive": true,
    "emailVerified": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### PATCH /api/users/me
Update user profile.

**Request:**
```json
{
  "firstName": "Jane",
  "theme": "dark",
  "fontSize": "large"
}
```

**Response:** Updated user object

#### POST /api/users/me/password
Change user password.

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### POST /api/auth/logout
Logout and invalidate refresh token.

**Request:**
```json
{
  "refreshToken": "a1b2c3..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

## Security Features

- **Rate Limiting**: 
  - Registration: 5 requests per 15 minutes
  - Login: 10 requests per 15 minutes
  - Password change: 5 requests per 15 minutes
- **Password Hashing**: bcrypt with 12 salt rounds
- **Token Security**: Short-lived access tokens, long-lived refresh tokens
- **Audit Logging**: All authentication events logged with IP and user agent
- **Token Rotation**: Refresh tokens are rotated on use

## Testing

```bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Start server
npm run dev

# Run tests (to be implemented)
npm test
```

## Next Steps

1. Implement unit tests for service layer
2. Implement integration tests for API endpoints
3. Add email verification flow
4. Implement MFA (TOTP) functionality
5. Add password reset via email
6. Add account lockout after failed attempts
