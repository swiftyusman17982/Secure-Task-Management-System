
# secure-task-management-system

=======
# Secure Task Management System

> **Full-Stack Task Management with Role-Based Access Control (RBAC)**

A production-ready task management system built with NX monorepo, featuring JWT authentication, organizational hierarchy, and a premium Angular dashboard with drag-and-drop Kanban board.

[![NX](https://img.shields.io/badge/NX-22.4.3-143055?style=flat&logo=nx)](https://nx.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=flat&logo=nestjs)](https://nestjs.com)
[![Angular](https://img.shields.io/badge/Angular-21.1-DD0031?style=flat&logo=angular)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+
- **npm**: v9+

### Installation & Setup

1. **Clone the repository**:

   ```bash
   cd /Users/mac/Desktop
   cd secure-task-management-system
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Configuration** (Optional):
   The system works out-of-the-box with SQLite and default settings. For production or custom configuration:

   ```bash
   # Backend configuration is in apps/api/.env
   # Default values are already set for development
   ```

4. **Start the Backend** (Terminal 1):

   ```bash
   npx nx serve api
   ```

   ✅ API running at **http://localhost:3000**

5. **Start the Frontend** (Terminal 2):

   ```bash
   npx nx serve dashboard
   ```

   ✅ Dashboard running at **http://localhost:4200**

6. **Login with Test Users**:
   The database is automatically seeded on first run:

   | Username | Password      | Role   | Capabilities                              |
   | -------- | ------------- | ------ | ----------------------------------------- |
   | `owner`  | `password123` | Owner  | Full access + child org data + audit logs |
   | `admin`  | `password123` | Admin  | Create, edit, delete tasks + audit logs   |
   | `viewer` | `password123` | Viewer | Read-only access to tasks                 |

---

## 📋 Features

### ✅ Core Features (All Implemented)

#### Backend (NestJS)

- ✅ **JWT Authentication**: Secure login with bcrypt password hashing
- ✅ **Role-Based Access Control (RBAC)**: Owner > Admin > Viewer hierarchy
- ✅ **Organization Hierarchy**: 2-level organization structure
- ✅ **Task Management**: Full CRUD operations with permission checks
- ✅ **Audit Logging**: All actions logged to database and console
- ✅ **Database**: TypeORM with SQLite (dev) / PostgreSQL (production-ready)
- ✅ **API Guards**: JWT + Roles guards on all protected endpoints

#### Frontend (Angular)

- ✅ **Authentication UI**: Beautiful login page with error handling
- ✅ **Kanban Board**: Drag-and-drop task management across statuses
- ✅ **Task Visualization**: Real-time completion progress bar and distribution chart
- ✅ **Category Filtering**: Filter tasks by Work/Personal categories
- ✅ **Responsive Design**: Mobile-first, works on all screen sizes
- ✅ **Dark/Light Mode**: Theme toggle with smooth transitions
- ✅ **Keyboard Shortcuts**: Press `N` to create new task
- ✅ **State Management**: Angular Signals for reactive updates
- ✅ **HTTP Interceptor**: Automatic JWT token attachment
- ✅ **Route Guards**: Protected routes for authenticated users only

#### Testing

- ✅ **Backend Unit Tests**: AuthService, RolesGuard
- ✅ **Backend E2E Tests**: Full API workflow with RBAC verification
- ✅ **Frontend Unit Tests**: LoginComponent, TaskListComponent
- ✅ **Test Coverage**: Critical authentication and authorization paths

---

## 🏗 Architecture Overview

### NX Monorepo Structure

```
secure-task-management-system/
├── apps/
│   ├── api/              # NestJS backend (Port 3000)
│   ├── api-e2e/          # Backend E2E tests
│   ├── dashboard/        # Angular frontend (Port 4200)
│   └── dashboard-e2e/    # Frontend E2E tests
├── libs/
│   ├── data/             # Shared TypeScript interfaces & DTOs
│   ├── auth/             # Reusable RBAC logic & guards
│   └── entities/         # TypeORM database entities
└── docs/
    ├── ERD.md            # Database schema with Mermaid diagrams
    ├── API.md            # Complete API documentation
    └── ARCHITECTURE.md   # System architecture details
```

### Technology Stack

| Layer        | Technology           | Purpose                                |
| ------------ | -------------------- | -------------------------------------- |
| **Frontend** | Angular 21 + Signals | Reactive UI with standalone components |
| **Styling**  | TailwindCSS          | Premium dark-mode design system        |
| **Backend**  | NestJS 11            | Modular, scalable API architecture     |
| **Database** | TypeORM + SQLite     | ORM with automatic migrations          |
| **Auth**     | JWT + Passport       | Stateless token-based authentication   |
| **Testing**  | Jest + Supertest     | Unit, integration, and E2E tests       |
| **Monorepo** | NX 22                | Build system and code sharing          |

### Data Model

```mermaid
erDiagram
    ORGANIZATION ||--o{ ORGANIZATION : "has children"
    ORGANIZATION ||--o{ USER : "contains"
    USER ||--o{ TASK : "owns"
    ORGANIZATION ||--o{ TASK : "scopes"

    ORGANIZATION {
        uuid id PK
        string name
        uuid parentId FK
    }

    USER {
        uuid id PK
        string username UK
        string password "bcrypt hashed"
        enum role "Owner/Admin/Viewer"
        uuid orgId FK
    }

    TASK {
        uuid id PK
        string title
        text description
        enum status "Todo/In Progress/Done"
        enum category "Work/Personal"
        uuid ownerId FK
        uuid orgId FK
        int order
    }
```

**📖 See [docs/ERD.md](docs/ERD.md) for complete schema and relationships**

---

## 🔐 Access Control Implementation

### Role Hierarchy

```
Owner (Level 3)
  ├─ All Admin permissions
  ├─ Access to child organization data
  └─ View audit logs

Admin (Level 2)
  ├─ Create, update, delete tasks
  ├─ View all tasks in organization
  └─ View audit logs

Viewer (Level 1)
  └─ Read-only access to tasks
```

### Security Features

1. **JWT Authentication**
   - Tokens expire in 24 hours
   - Payload includes: `{ userId, username, role, orgId }`
   - Stored in localStorage, attached via HTTP interceptor

2. **RBAC Guards**
   - `@Roles()` decorator on endpoints
   - Role inheritance (Owner can do everything Admin can)
   - Organization-scoped queries

3. **Password Security**
   - bcrypt hashing with 10 salt rounds
   - Passwords never returned in API responses

4. **Audit Logging**
   - All CREATE, UPDATE, DELETE actions logged
   - Includes: userId, action, resource, timestamp, details

---

## 🔌 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Key Endpoints

| Method   | Endpoint           | Description           | Required Role |
| -------- | ------------------ | --------------------- | ------------- |
| `POST`   | `/auth/login`      | Authenticate user     | Public        |
| `GET`    | `/auth/profile`    | Get current user      | Authenticated |
| `GET`    | `/tasks`           | List accessible tasks | Viewer+       |
| `POST`   | `/tasks`           | Create new task       | Admin+        |
| `PUT`    | `/tasks/:id`       | Update task           | Admin+        |
| `DELETE` | `/tasks/:id`       | Delete task           | Admin+        |
| `GET`    | `/tasks/audit-log` | View system logs      | Admin+        |

**📖 See [docs/API.md](docs/API.md) for complete API documentation with examples**

---

## 🧪 Testing

### Run All Tests

```bash
# Backend unit tests
npx nx test api

# Backend E2E tests
npx nx e2e api-e2e

# Frontend unit tests
npx nx test dashboard

# Frontend E2E tests
npx nx e2e dashboard-e2e
```

### Test Coverage

```bash
# Backend coverage
npx nx test api --coverage

# Frontend coverage
npx nx test dashboard --coverage
```

### What's Tested

- ✅ JWT authentication flow
- ✅ Password hashing and validation
- ✅ Role hierarchy enforcement
- ✅ RBAC guard logic
- ✅ Task CRUD operations
- ✅ Organization scoping
- ✅ Audit log creation
- ✅ Frontend component rendering
- ✅ State management with Signals

---

## 🎨 UI/UX Highlights

### Premium Design Features

- **Glassmorphism**: Frosted glass effects on cards
- **Smooth Animations**: Micro-interactions on hover and drag
- **Gradient Accents**: Vibrant indigo-purple color scheme
- **Dark Mode**: Default dark theme with light mode toggle
- **Responsive**: Mobile-first design (320px → 4K)

### Keyboard Shortcuts

- `N` - Create new task (when not in input field)

### Drag & Drop

- Drag tasks between Todo → In Progress → Done
- Visual feedback with shadows and scaling
- Automatic status update on drop

---

## 📦 Build for Production

### Backend

```bash
npx nx build api
node dist/apps/api/main.js
```

### Frontend

```bash
npx nx build dashboard --configuration=production
# Serve from dist/apps/dashboard/browser
```

### Environment Variables (Production)

Create `apps/api/.env`:

```env
JWT_SECRET=your-super-secret-production-key
JWT_EXPIRATION=24h
DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
NODE_ENV=production
PORT=3000
```

---

## 🔮 Future Enhancements

### Planned Features

- **Refresh Tokens**: Implement JWT rotation for better security
- **N-Level Hierarchy**: Support unlimited organization depth
- **Real-time Updates**: WebSockets for live task synchronization
- **Task Assignments**: Assign tasks to specific users
- **Due Dates & Reminders**: Email/push notifications
- **File Attachments**: Upload files to tasks
- **Comments**: Task discussion threads
- **Search**: Full-text search across tasks

### Production Hardening

- **Redis Caching**: Cache RBAC permissions and sessions
- **Rate Limiting**: Prevent brute-force attacks
- **CSRF Protection**: Add CSRF tokens
- **Database Migrations**: Proper migration strategy
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry integration
- **Load Balancing**: Horizontal scaling support

---

## 📚 Documentation

- **[ERD.md](docs/ERD.md)** - Database schema, relationships, and diagrams
- **[API.md](docs/API.md)** - Complete API reference with examples
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and design decisions

---

## 🤝 Development

### Code Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Type Safety**: Strict TypeScript mode

### Project Structure

- **Modular**: Clear separation of concerns
- **DRY**: Shared libraries for common code
- **Testable**: Dependency injection throughout
- **Scalable**: NX workspace for monorepo management

---

## 📝 License

MIT

---

## 👨‍💻 Assessment Notes

**Time Allocation**: Designed to be completed within 8 hours

**Key Achievements**:

- ✅ Complete RBAC implementation with role hierarchy
- ✅ Real JWT authentication (not mocked)
- ✅ Organization hierarchy with 2-level structure
- ✅ Comprehensive audit logging
- ✅ Premium UI with dark mode and drag-and-drop
- ✅ Full test coverage for critical paths
- ✅ Production-ready architecture
- ✅ Detailed documentation with diagrams

**Technology Choices**:

- **SQLite**: For simplicity and portability (easily switches to PostgreSQL)
- **Angular Signals**: Modern, performant state management
- **Standalone Components**: Latest Angular best practices
- **TailwindCSS**: Rapid UI development with custom design system
- **NX Monorepo**: Professional-grade code organization





