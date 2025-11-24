# AgenticWIT Frontend

Enterprise Work Item Tracking System - Frontend Application

## Overview

This is the frontend application for AgenticWIT, built with Next.js 14, TypeScript, Tailwind CSS, and modern React patterns. The application provides an accessible, enterprise-grade interface for managing work items, projects, and team collaboration.

## Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0
- **Backend API**: Running at `http://localhost:3001`

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI (accessible primitives)
- **State Management**: Zustand
- **Server State**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Development**: ESLint, Prettier
- **Accessibility**: axe-core, jsx-a11y

## Getting Started

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Configure environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=AgenticWIT
NODE_ENV=development
```

### 3. Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:a11y` - Run accessibility tests

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── navigation.tsx
│   └── feedback/                 # Feedback components
│       ├── loading.tsx
│       └── error.tsx
├── lib/
│   ├── api-client.ts             # Axios instance
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # App constants
├── hooks/
│   ├── use-auth.ts               # Authentication hook
│   └── use-api.ts                # API data fetching hook
├── store/
│   ├── auth-store.ts             # Auth state management
│   └── theme-store.ts            # Theme state management
├── types/
│   ├── user.ts                   # User types
│   └── api.ts                    # API types
└── styles/
    └── globals.css               # Global CSS

```

## Design System

The application uses a custom design system based on the specifications in `specs/ui-mockups-spec.md`:

### Colors

- **Primary**: Blue palette for primary actions
- **Gray**: Neutral palette for text and backgrounds
- **Status**: Success (green), Warning (orange), Error (red)
- **Work Item Types**: Epic (purple), Feature (blue), Story (green), Task (orange), Bug (red), Debt (gray)

### Typography

- **Font Family**: Inter (sans-serif), JetBrains Mono (monospace)
- **Scale**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl

### Spacing

Custom spacing scale with additional 18 (4.5rem) and 88 (22rem) values.

## Development Workflow

### 1. Code Style

The project uses ESLint and Prettier for code quality:

```bash
# Check linting
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

### 2. Accessibility

Accessibility is a first-class concern:

- All interactive elements are keyboard navigable
- ARIA labels and roles are properly implemented
- Color contrast ratios meet WCAG AA standards
- Screen reader support is enabled
- Focus indicators are visible

Run accessibility tests:

```bash
npm run test:a11y
```

### 3. State Management

**Client State (Zustand)**:
- Authentication state
- Theme preferences
- UI state

**Server State (React Query)**:
- API data fetching
- Caching and synchronization
- Optimistic updates

### 4. API Integration

The API client is configured to connect to the backend at `http://localhost:3001`:

```typescript
import { apiClient } from '@/lib/api-client';

// Example API call
const response = await apiClient.get('/users');
```

Backend API documentation: `http://localhost:3001/docs`

## Accessibility Guidelines

1. **Keyboard Navigation**: All interactive elements must be accessible via keyboard
2. **ARIA Labels**: Use appropriate ARIA attributes for screen readers
3. **Focus Management**: Ensure visible focus indicators
4. **Color Contrast**: Maintain WCAG AA compliance (4.5:1 for text)
5. **Semantic HTML**: Use proper HTML elements
6. **Alt Text**: Provide descriptive alt text for images

## Testing

### Unit Tests

```bash
npm run test
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Accessibility Tests

```bash
npm run test:a11y
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
PORT=3001 npm run dev
```

### API Connection Issues

1. Ensure backend is running at `http://localhost:3001`
2. Check CORS configuration on backend
3. Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Related Documentation

- [Backend API Documentation](http://localhost:3001/docs)
- [UI Design Specifications](../specs/ui-mockups-spec.md)
- [Comprehensive Specification](../specs/comprehensive-spec.md)
- [System Architecture](../specs/system-architecture-diagram.md)

## Contributing

1. Follow the existing code style
2. Write accessible code
3. Add tests for new features
4. Update documentation
5. Run linting and tests before committing

## Dependencies

### Core Dependencies

- `next`: ^14.0.4
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `@tanstack/react-query`: ^5.14.2
- `zustand`: ^4.4.7
- `axios`: Latest
- `tailwindcss`: ^3.4.0
- `clsx`: ^2.0.0
- `tailwind-merge`: ^2.2.0

### Radix UI Components

- `@radix-ui/react-dialog`: ^1.0.5
- `@radix-ui/react-dropdown-menu`: ^2.0.6
- `@radix-ui/react-select`: ^2.0.0
- `@radix-ui/react-toast`: ^1.1.5
- And more...

### Development Tools

- `typescript`: ^5.3.3
- `eslint`: ^8.56.0
- `prettier`: ^3.1.1
- `@axe-core/react`: ^4.8.3
- `eslint-plugin-jsx-a11y`: Latest

## Support

For issues and questions:
- Check the [comprehensive specification](../specs/comprehensive-spec.md)
- Review [UI mockups](../specs/ui-mockups-spec.md)
- Contact the development team

## License

Proprietary - AgenticWIT Enterprise
