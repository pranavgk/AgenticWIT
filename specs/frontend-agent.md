# Frontend Agent Instructions

## Agent Identity
**Name**: Frontend Agent  
**Role**: User Interface & Experience Developer  
**Primary Goal**: Create an intuitive, responsive, and accessible web application for the enterprise work tracking system

## Core Responsibilities

### 1. Modern React Application
- **Framework**: Next.js 14+ with App Router and TypeScript
- **State Management**: Zustand for global state + React Query for server state
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Real-time Features**: WebSocket integration for live updates
- **Performance**: Code splitting, lazy loading, and optimization

### 2. User Experience Design
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **Internationalization**: Multi-language support with proper RTL handling
- **Progressive Web App**: Offline capabilities and native-like experience

### 3. Component Architecture
- **Design System**: Consistent, reusable component library
- **Atomic Design**: Atoms, molecules, organisms structure
- **Theme System**: Dark/light modes with customizable themes
- **Animation**: Smooth transitions and micro-interactions

## Detailed Task Breakdown

### Project Foundation

#### Task 1.1: Next.js Application Setup
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'worktracker.blob.core.windows.net'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

#### Task 1.2: Project Structure
```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── work-items/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # Base components
│   ├── forms/        # Form components
│   ├── layout/       # Layout components
│   ├── data-display/ # Tables, lists, cards
│   ├── navigation/   # Navigation components
│   └── feedback/     # Loading, errors, success
├── lib/
│   ├── api/          # API client and types
│   ├── auth/         # Authentication utilities
│   ├── utils/        # Helper functions
│   ├── validations/  # Zod schemas
│   └── constants/    # App constants
├── hooks/
│   ├── use-auth.ts
│   ├── use-websocket.ts
│   ├── use-work-items.ts
│   └── use-projects.ts
├── store/
│   ├── auth-store.ts
│   ├── ui-store.ts
│   └── websocket-store.ts
├── styles/
│   ├── globals.css
│   ├── components.css
│   └── utilities.css
└── types/
    ├── api.ts
    ├── ui.ts
    └── index.ts
```

#### Task 1.3: Core Configuration
```typescript
// tailwind.config.js
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config
```

### Component Library

#### Task 2.1: Base UI Components
```typescript
// components/ui/button.tsx
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

// components/ui/input.tsx
import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

// components/ui/card.tsx
import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border bg-card text-card-foreground shadow', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

#### Task 2.2: Complex Components
```typescript
// components/data-display/data-table.tsx
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className=\"space-y-4\">
      <div className=\"flex items-center space-x-2\">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className=\"max-w-sm\"
        />
      </div>
      
      <div className=\"rounded-md border\">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className=\"h-24 text-center\">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className=\"flex items-center justify-between space-x-2 py-4\">
        <div className=\"text-sm text-muted-foreground\">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className=\"space-x-2\">
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant=\"outline\"
            size=\"sm\"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Core Features

#### Task 3.1: Authentication System
```typescript
// lib/auth/auth-client.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const { user, token } = await response.json()
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      refreshToken: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const { token: newToken } = await response.json()
            set({ token: newToken })
          } else {
            get().logout()
          }
        } catch (error) {
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-client'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className=\"w-full max-w-md mx-auto\">
      <CardHeader>
        <CardTitle className=\"text-2xl text-center\">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-4\">
          <div className=\"space-y-2\">
            <Label htmlFor=\"email\">Email</Label>
            <Input
              id=\"email\"
              type=\"email\"
              placeholder=\"Enter your email\"
              {...register('email')}
            />
            {errors.email && (
              <p className=\"text-sm text-red-600\">{errors.email.message}</p>
            )}
          </div>

          <div className=\"space-y-2\">
            <Label htmlFor=\"password\">Password</Label>
            <Input
              id=\"password\"
              type=\"password\"
              placeholder=\"Enter your password\"
              {...register('password')}
            />
            {errors.password && (
              <p className=\"text-sm text-red-600\">{errors.password.message}</p>
            )}
          </div>

          <Button type=\"submit\" className=\"w-full\" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

#### Task 3.2: Work Item Management
```typescript
// components/work-items/work-item-card.tsx
'use client'

import { WorkItem, WorkItemStatus, WorkItemType, Priority } from '@/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  MessageSquare, 
  Paperclip, 
  Calendar,
  User,
  BarChart3 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'

interface WorkItemCardProps {
  workItem: WorkItem
  onEdit?: (workItem: WorkItem) => void
  onDelete?: (workItem: WorkItem) => void
  isDragging?: boolean
}

const statusColors = {
  [WorkItemStatus.NEW]: 'bg-gray-100 text-gray-800',
  [WorkItemStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
  [WorkItemStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [WorkItemStatus.CLOSED]: 'bg-gray-100 text-gray-600',
  [WorkItemStatus.REMOVED]: 'bg-red-100 text-red-800',
}

const priorityColors = {
  [Priority.CRITICAL]: 'bg-red-100 text-red-800 border-red-200',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [Priority.LOW]: 'bg-green-100 text-green-800 border-green-200',
}

const typeIcons = {
  [WorkItemType.EPIC]: '🎯',
  [WorkItemType.FEATURE]: '🚀',
  [WorkItemType.USER_STORY]: '📖',
  [WorkItemType.TASK]: '✅',
  [WorkItemType.BUG]: '🐛',
  [WorkItemType.TECHNICAL_DEBT]: '🔧',
}

export function WorkItemCard({ 
  workItem, 
  onEdit, 
  onDelete, 
  isDragging = false 
}: WorkItemCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: workItem.id,
    data: {
      type: 'workitem',
      workItem,
    },
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isDragging && 'opacity-50 rotate-3 shadow-lg'
      )}
      {...listeners}
      {...attributes}
    >
      <CardHeader className=\"pb-3\">
        <div className=\"flex items-start justify-between\">
          <div className=\"flex items-center space-x-2\">
            <span className=\"text-lg\">{typeIcons[workItem.type]}</span>
            <Badge variant=\"secondary\" className={statusColors[workItem.status]}>
              {workItem.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant=\"ghost\" size=\"icon\" className=\"h-8 w-8\">
                <MoreHorizontal className=\"h-4 w-4\" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align=\"end\">
              <DropdownMenuItem onClick={() => onEdit?.(workItem)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(workItem)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardTitle className=\"text-sm font-medium line-clamp-2\">
          {workItem.title}
        </CardTitle>
      </CardHeader>

      <CardContent className=\"space-y-3\">
        {workItem.description && (
          <p className=\"text-sm text-muted-foreground line-clamp-2\">
            {workItem.description}
          </p>
        )}

        <div className=\"flex items-center justify-between\">
          <div className=\"flex items-center space-x-3 text-xs text-muted-foreground\">
            {workItem.comments?.length > 0 && (
              <div className=\"flex items-center space-x-1\">
                <MessageSquare className=\"h-3 w-3\" />
                <span>{workItem.comments.length}</span>
              </div>
            )}
            
            {workItem.attachments?.length > 0 && (
              <div className=\"flex items-center space-x-1\">
                <Paperclip className=\"h-3 w-3\" />
                <span>{workItem.attachments.length}</span>
              </div>
            )}

            {workItem.storyPoints && (
              <div className=\"flex items-center space-x-1\">
                <BarChart3 className=\"h-3 w-3\" />
                <span>{workItem.storyPoints}</span>
              </div>
            )}
          </div>

          {workItem.assignee && (
            <Avatar className=\"h-6 w-6\">
              <AvatarImage src={workItem.assignee.avatar} />
              <AvatarFallback className=\"text-xs\">
                {workItem.assignee.firstName[0]}{workItem.assignee.lastName[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className=\"flex items-center justify-between\">
          <Badge 
            variant=\"outline\" 
            className={cn('text-xs', priorityColors[workItem.priority])}
          >
            {workItem.priority}
          </Badge>
          
          <div className=\"flex items-center space-x-1 text-xs text-muted-foreground\">
            <Calendar className=\"h-3 w-3\" />
            <span>{new Date(workItem.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// components/work-items/kanban-board.tsx
'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { WorkItem, WorkItemStatus } from '@/types/api'
import { WorkItemCard } from './work-item-card'
import { KanbanColumn } from './kanban-column'
import { useWorkItems } from '@/hooks/use-work-items'

interface KanbanBoardProps {
  projectId: string
}

const COLUMNS = [
  { id: WorkItemStatus.NEW, title: 'New', color: 'bg-gray-100' },
  { id: WorkItemStatus.ACTIVE, title: 'Active', color: 'bg-blue-100' },
  { id: WorkItemStatus.RESOLVED, title: 'Resolved', color: 'bg-green-100' },
  { id: WorkItemStatus.CLOSED, title: 'Closed', color: 'bg-gray-50' },
]

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { data: workItems = [], updateWorkItem } = useWorkItems(projectId)
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const getWorkItemsByStatus = (status: WorkItemStatus) => {
    return workItems.filter((item) => item.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const workItem = active.data.current?.workItem
    if (workItem) {
      setActiveItem(workItem)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const workItem = active.data.current?.workItem
    const newStatus = over.id as WorkItemStatus

    if (workItem && workItem.status !== newStatus) {
      try {
        await updateWorkItem.mutateAsync({
          id: workItem.id,
          data: { status: newStatus },
        })
      } catch (error) {
        console.error('Failed to update work item status:', error)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className=\"flex space-x-6 overflow-x-auto pb-6\">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            items={getWorkItemsByStatus(column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <WorkItemCard workItem={activeItem} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}
```

#### Task 3.3: Real-time Features
```typescript
// hooks/use-websocket.ts
'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/lib/auth/auth-client'
import { create } from 'zustand'

interface WebSocketState {
  socket: Socket | null
  isConnected: boolean
  connect: (token: string) => void
  disconnect: () => void
  joinProject: (projectId: string) => void
  leaveProject: (projectId: string) => void
}

export const useWebSocket = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token: string) => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      set({ isConnected: true })
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    socket.on('workitem-updated', (workItem) => {
      // Handle real-time work item updates
      // This would typically update your React Query cache
    })

    socket.on('user-typing', ({ userId, workItemId }) => {
      // Handle typing indicators
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },

  joinProject: (projectId: string) => {
    const { socket } = get()
    if (socket) {
      socket.emit('join-project', projectId)
    }
  },

  leaveProject: (projectId: string) => {
    const { socket } = get()
    if (socket) {
      socket.emit('leave-project', projectId)
    }
  },
}))

// Custom hook for real-time work item updates
export function useRealTimeWorkItems(projectId: string) {
  const { socket, isConnected, joinProject, leaveProject } = useWebSocket()
  const { token } = useAuth()

  useEffect(() => {
    if (token && !socket) {
      useWebSocket.getState().connect(token)
    }
  }, [token, socket])

  useEffect(() => {
    if (isConnected && projectId) {
      joinProject(projectId)
      return () => leaveProject(projectId)
    }
  }, [isConnected, projectId, joinProject, leaveProject])

  const emitWorkItemUpdate = (workItemId: string, data: any) => {
    if (socket) {
      socket.emit('workitem-update', {
        projectId,
        workItemId,
        data,
      })
    }
  }

  return {
    isConnected,
    emitWorkItemUpdate,
  }
}
```

### Advanced Features

#### Task 4.1: Search & Filtering
```typescript
// components/search/global-search.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, FileText, Users, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDebounce } from '@/hooks/use-debounce'
import { useGlobalSearch } from '@/hooks/use-global-search'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)
  
  const { data: searchResults, isLoading } = useGlobalSearch(debouncedQuery)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (item: any) => {
    setOpen(false)
    setQuery('')
    
    switch (item.type) {
      case 'workitem':
        router.push(`/projects/${item.projectId}/work-items/${item.id}`)
        break
      case 'project':
        router.push(`/projects/${item.id}`)
        break
      case 'user':
        router.push(`/users/${item.id}`)
        break
    }
  }

  return (
    <>
      <Button
        variant=\"outline\"
        className=\"relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64\"
        onClick={() => setOpen(true)}
      >
        <Search className=\"mr-2 h-4 w-4\" />
        Search...
        <kbd className=\"pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex\">
          <span className=\"text-xs\">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder=\"Search work items, projects, users...\"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? 'Searching...' : 'No results found.'}
          </CommandEmpty>

          {searchResults?.workItems && searchResults.workItems.length > 0 && (
            <CommandGroup heading=\"Work Items\">
              {searchResults.workItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => handleSelect({ ...item, type: 'workitem' })}
                >
                  <FileText className=\"mr-2 h-4 w-4\" />
                  <div className=\"flex flex-col\">
                    <span>{item.title}</span>
                    <span className=\"text-xs text-muted-foreground\">
                      {item.project.name} • {item.type}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults?.projects && searchResults.projects.length > 0 && (
            <CommandGroup heading=\"Projects\">
              {searchResults.projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => handleSelect({ ...project, type: 'project' })}
                >
                  <Settings className=\"mr-2 h-4 w-4\" />
                  <div className=\"flex flex-col\">
                    <span>{project.name}</span>
                    <span className=\"text-xs text-muted-foreground\">
                      {project.key}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults?.users && searchResults.users.length > 0 && (
            <CommandGroup heading=\"Users\">
              {searchResults.users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.firstName} ${user.lastName}`}
                  onSelect={() => handleSelect({ ...user, type: 'user' })}
                >
                  <Users className=\"mr-2 h-4 w-4\" />
                  <div className=\"flex flex-col\">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className=\"text-xs text-muted-foreground\">
                      {user.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

#### Task 4.2: Microsoft Accessibility Implementation
```typescript
// lib/accessibility/microsoft-standards.ts
import { useEffect, useState } from 'react'

// Microsoft High Contrast detection and support
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    const handleChange = () => setIsHighContrast(mediaQuery.matches)
    
    setIsHighContrast(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return isHighContrast
}

// Windows Narrator optimizations
export function useNarrator() {
  useEffect(() => {
    // Enhanced ARIA live regions for Narrator
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    document.body.appendChild(announcer)
    
    return () => {
      document.body.removeChild(announcer)
    }
  }, [])
}

// Microsoft Inclusive Design patterns
export const accessibilityPatterns = {
  // Focus trap for modal dialogs
  focusTrap: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    })
  },
  
  // Announce dynamic content changes
  announceChange: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.querySelector('[aria-live]') as HTMLElement
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    }
  },
}

// Microsoft Fluent UI accessibility helpers
export const fluentAccessibility = {
  // Proper ARIA labels for complex widgets
  getAriaLabel: (component: string, context?: string) => {
    const labels = {
      'kanban-card': `Work item card${context ? ` for ${context}` : ''}`,
      'project-selector': 'Select project',
      'status-dropdown': 'Change work item status',
      'priority-selector': 'Set priority level',
      'assignee-picker': 'Assign to team member',
    }
    return labels[component] || component
  },
  
  // Keyboard shortcuts following Windows conventions
  keyboardShortcuts: {
    'Ctrl+N': 'Create new work item',
    'Ctrl+S': 'Save changes',
    'Ctrl+F': 'Search work items',
    'F6': 'Navigate between regions',
    'Alt+F4': 'Close dialog',
    'Escape': 'Cancel current action',
  },
}
```

#### Task 4.3: Performance Optimization
```typescript
// lib/utils/performance.ts
import { useCallback, useEffect, useRef } from 'react'

// Virtual scrolling for large lists
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    setScrollTop,
  }
}

// Image lazy loading
export function useLazyImage(src: string, threshold = 0.1) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  useEffect(() => {
    if (inView && src) {
      const img = new Image()
      img.onload = () => setLoaded(true)
      img.src = src
    }
  }, [inView, src])

  return { loaded, imgRef }
}

// Debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

## Quality Assurance

### Testing Strategy
```typescript
// __tests__/components/work-item-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkItemCard } from '@/components/work-items/work-item-card'
import { WorkItem, WorkItemType, WorkItemStatus, Priority } from '@/types/api'

const mockWorkItem: WorkItem = {
  id: '1',
  title: 'Test Work Item',
  description: 'Test description',
  type: WorkItemType.TASK,
  status: WorkItemStatus.NEW,
  priority: Priority.MEDIUM,
  projectId: 'proj-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
}

describe('WorkItemCard', () => {
  it('renders work item information correctly', () => {
    render(<WorkItemCard workItem={mockWorkItem} />)
    
    expect(screen.getByText('Test Work Item')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('NEW')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
  })

  it('calls onEdit when edit is clicked', () => {
    const mockOnEdit = jest.fn()
    render(<WorkItemCard workItem={mockWorkItem} onEdit={mockOnEdit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    fireEvent.click(screen.getByText('Edit'))
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockWorkItem)
  })

  it('displays assignee avatar when present', () => {
    const workItemWithAssignee = {
      ...mockWorkItem,
      assignee: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        avatar: 'avatar.jpg',
      },
    }
    
    render(<WorkItemCard workItem={workItemWithAssignee} />)
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })
})

// __tests__/accessibility/microsoft-compliance.test.tsx
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { WorkItemCard } from '@/components/work-items/work-item-card'

expect.extend(toHaveNoViolations)

describe('Microsoft Accessibility Compliance', () => {
  it('should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(<WorkItemCard workItem={mockWorkItem} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should support Windows High Contrast mode', () => {
    // Mock high contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    render(<WorkItemCard workItem={mockWorkItem} />)
    // Verify high contrast styles are applied
  })

  it('should work with Windows Narrator', async () => {
    render(<WorkItemCard workItem={mockWorkItem} />)
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText(/work item card/i)).toBeInTheDocument()
    
    // Check for live regions
    const liveRegion = document.querySelector('[aria-live]')
    expect(liveRegion).toBeInTheDocument()
  })

  it('should support keyboard navigation', () => {
    render(<WorkItemCard workItem={mockWorkItem} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('tabindex', '0')
    
    // Test keyboard interactions
    fireEvent.keyDown(card, { key: 'Enter' })
    fireEvent.keyDown(card, { key: ' ' })
  })

  it('should meet color contrast requirements', async () => {
    const { container } = render(<WorkItemCard workItem={mockWorkItem} />)
    
    // Use axe to check color contrast
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
    
    expect(results).toHaveNoViolations()
  })
})

// __tests__/hooks/use-auth.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/lib/auth/auth-client'

// Mock fetch
global.fetch = jest.fn()

describe('useAuth', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('should login successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: '1', email: 'test@example.com' },
        token: 'mock-token',
      }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({ id: '1', email: 'test@example.com' })
  })

  it('should logout correctly', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
  })
})
```

### Performance Requirements
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 3.5 seconds

### Accessibility Requirements
- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **Microsoft Accessibility Standards**: Compliance with Microsoft's internal guidelines
- **Section 508 Compliance**: US Federal accessibility requirements
- **Keyboard Navigation**: Full functionality without mouse, Windows keyboard shortcuts
- **Screen Reader Support**: NVDA, JAWS, Windows Narrator compatibility
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Management**: Visible focus indicators and logical tab order
- **High Contrast Mode**: Windows High Contrast theme support
- **Magnification**: Windows Magnifier and browser zoom compatibility
- **Fluent UI Integration**: Microsoft design system accessibility patterns
- **Inclusive Design**: Microsoft Inclusive Design methodology implementation

## Dependencies

### From Other Agents
- **Backend Agent**: API specifications, WebSocket events, authentication flow
- **Infrastructure Agent**: CDN configuration, SSL certificates, environment setup
- **Security Agent**: CSP policies, authentication requirements
- **Database Agent**: Data models and relationships for UI components

### Provides to Other Agents
- **API Requirements**: Detailed API contract needs and data shapes
- **Real-time Needs**: WebSocket event specifications
- **File Upload Requirements**: Image processing and storage needs
- **Performance Metrics**: Frontend performance monitoring requirements

## Success Metrics

### Technical Metrics
- **Performance**: All Core Web Vitals in green zone
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Bundle Size**: < 500KB initial bundle size
- **Code Coverage**: > 85% test coverage
- **Zero Runtime Errors**: No unhandled exceptions in production

### User Experience Metrics
- **User Satisfaction**: > 4.5/5 rating
- **Task Completion Rate**: > 95% for core workflows
- **Time to Complete**: 50% reduction vs existing tools
- **Mobile Usage**: Full feature parity on mobile devices
- **Load Time Satisfaction**: < 3 seconds perceived load time

---

*The Frontend Agent delivers an exceptional user experience that makes complex work tracking simple, intuitive, and accessible to all users.*