# Entity Relationship Diagram

## Database Schema

```mermaid
erDiagram
    ORGANIZATION ||--o{ ORGANIZATION : "has children"
    ORGANIZATION ||--o{ USER : "contains"
    USER ||--o{ TASK : "owns"
    ORGANIZATION ||--o{ TASK : "scopes"
    USER ||--o{ AUDIT_LOG : "performs"

    ORGANIZATION {
        uuid id PK
        string name
        uuid parentId FK "nullable, self-reference"
        timestamp createdAt
        timestamp updatedAt
    }

    USER {
        uuid id PK
        string username UK "unique"
        string password "hashed, bcrypt"
        enum role "Owner, Admin, Viewer"
        uuid orgId FK
        timestamp createdAt
        timestamp updatedAt
    }

    TASK {
        uuid id PK
        string title
        text description
        enum status "Todo, In Progress, Done"
        enum category "Work, Personal"
        uuid ownerId FK
        uuid orgId FK
        int order "for drag-drop positioning"
        timestamp createdAt
        timestamp updatedAt
    }

    AUDIT_LOG {
        uuid id PK
        string action "CREATE, UPDATE, DELETE"
        uuid userId FK
        string resource "Task, User, etc"
        uuid resourceId "nullable"
        text details "JSON or string"
        timestamp timestamp
    }
```

## Relationships Explained

### Organization Hierarchy (2-Level)

- **Self-Referencing**: Organizations can have a `parentId` pointing to another organization
- **Example Structure**:
  ```
  Acme Corp (parentId: null)
    └── Acme Research (parentId: Acme Corp.id)
  ```
- **Access Control**: Owners at parent level can access child organization data

### User-Organization Relationship

- **Many-to-One**: Multiple users belong to one organization
- **Role Assignment**: Each user has exactly one role (Owner, Admin, or Viewer)
- **Scoping**: Users can only access data within their organization (and child orgs for Owners)

### Task Ownership

- **Owner**: Each task has one owner (User)
- **Organization Scope**: Tasks are scoped to an organization
- **Visibility**:
  - Viewers: Can see all tasks in their org
  - Admins: Can see and modify all tasks in their org
  - Owners: Can see and modify tasks in their org and child orgs

### Audit Logging

- **Automatic**: All CRUD operations on tasks are logged
- **Traceability**: Each log entry links to the user who performed the action
- **Details**: Stores additional context (e.g., "Created task: Build Login UI")

## Role Hierarchy & Permissions

```mermaid
graph TD
    A[Owner - Level 3] -->|inherits| B[Admin - Level 2]
    B -->|inherits| C[Viewer - Level 1]

    A -->|Can| D[All Admin permissions]
    A -->|Can| E[Access child org data]
    A -->|Can| F[View audit logs]

    B -->|Can| G[Create tasks]
    B -->|Can| H[Update tasks]
    B -->|Can| I[Delete tasks]
    B -->|Can| F

    C -->|Can| J[View tasks]
    C -->|Can| K[View own profile]
```

## Data Flow: Task Creation

```mermaid
sequenceDiagram
    participant U as User (Admin)
    participant F as Frontend
    participant G as JWT Guard
    participant R as Roles Guard
    participant S as Task Service
    participant DB as Database
    participant A as Audit Service

    U->>F: Create Task Request
    F->>G: POST /api/tasks + JWT
    G->>G: Verify JWT Token
    G->>R: Check Role Permissions
    R->>R: Verify Admin/Owner Role
    R->>S: Forward Request
    S->>DB: Insert Task (with orgId)
    DB-->>S: Task Created
    S->>A: Log Action
    A->>DB: Insert Audit Log
    S-->>F: Return Task
    F-->>U: Display Success
```

## Security Model

### Authentication Flow

1. User submits credentials (username + password)
2. Backend validates against hashed password (bcrypt)
3. JWT token generated with payload: `{ userId, username, role, orgId }`
4. Token stored in localStorage on frontend
5. HTTP Interceptor attaches token to all requests
6. JWT Guard validates token on every protected endpoint

### Authorization Flow

1. JWT Guard extracts user from token
2. Roles Guard checks required roles for endpoint
3. Role hierarchy applied (Owner > Admin > Viewer)
4. Organization scoping enforced in service layer
5. Database queries filtered by `orgId`

## Indexing Strategy (Production Recommendations)

```sql
-- Performance indexes
CREATE INDEX idx_user_orgId ON users(orgId);
CREATE INDEX idx_task_orgId ON tasks(orgId);
CREATE INDEX idx_task_ownerId ON tasks(ownerId);
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_audit_userId ON audit_logs(userId);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_org_parentId ON organizations(parentId);
```
