# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/login` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Authentication

#### POST /auth/login

Authenticate user and receive JWT token.

**Request:**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "admin",
    "role": "Admin",
    "orgId": "org-uuid"
  }
}
```

**Error (401):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

#### GET /auth/profile

Get current authenticated user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "userId": "uuid-here",
  "username": "admin",
  "role": "Admin",
  "orgId": "org-uuid"
}
```

---

### Tasks

#### GET /tasks

List all tasks accessible to the authenticated user (scoped by organization).

**Headers:**

```
Authorization: Bearer <token>
```

**Required Role:** Viewer (or higher)

**Response (200):**

```json
[
  {
    "id": "task-uuid-1",
    "title": "Build Login UI",
    "description": "Create responsive login page with form validation",
    "status": "In Progress",
    "category": "Work",
    "ownerId": "user-uuid",
    "orgId": "org-uuid",
    "order": 0,
    "createdAt": "2026-01-30T10:00:00.000Z",
    "updatedAt": "2026-01-30T12:00:00.000Z"
  },
  {
    "id": "task-uuid-2",
    "title": "Write API Tests",
    "description": "Add comprehensive e2e tests for all endpoints",
    "status": "Todo",
    "category": "Work",
    "ownerId": "user-uuid",
    "orgId": "org-uuid",
    "order": 1,
    "createdAt": "2026-01-30T11:00:00.000Z",
    "updatedAt": "2026-01-30T11:00:00.000Z"
  }
]
```

---

#### POST /tasks

Create a new task.

**Headers:**

```
Authorization: Bearer <token>
```

**Required Role:** Admin (or Owner)

**Request:**

```json
{
  "title": "Implement Dark Mode",
  "description": "Add theme toggle with CSS variables",
  "category": "Work",
  "status": "Todo"
}
```

**Response (201):**

```json
{
  "id": "new-task-uuid",
  "title": "Implement Dark Mode",
  "description": "Add theme toggle with CSS variables",
  "status": "Todo",
  "category": "Work",
  "ownerId": "current-user-uuid",
  "orgId": "current-org-uuid",
  "order": 0,
  "createdAt": "2026-01-30T15:00:00.000Z",
  "updatedAt": "2026-01-30T15:00:00.000Z"
}
```

**Error (403):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

#### PUT /tasks/:id

Update an existing task.

**Headers:**

```
Authorization: Bearer <token>
```

**Required Role:** Admin (or Owner)

**Request:**

```json
{
  "title": "Implement Dark Mode (Updated)",
  "status": "In Progress",
  "order": 5
}
```

**Response (200):**

```json
{
  "id": "task-uuid",
  "title": "Implement Dark Mode (Updated)",
  "description": "Add theme toggle with CSS variables",
  "status": "In Progress",
  "category": "Work",
  "ownerId": "user-uuid",
  "orgId": "org-uuid",
  "order": 5,
  "createdAt": "2026-01-30T15:00:00.000Z",
  "updatedAt": "2026-01-30T16:00:00.000Z"
}
```

---

#### DELETE /tasks/:id

Delete a task.

**Headers:**

```
Authorization: Bearer <token>
```

**Required Role:** Admin (or Owner)

**Response (200):**

```json
true
```

**Error (404):**

```json
{
  "statusCode": 404,
  "message": "Task not found"
}
```

---

### Audit Logs

#### GET /tasks/audit-log

Retrieve system audit logs (all CRUD operations on tasks).

**Headers:**

```
Authorization: Bearer <token>
```

**Required Role:** Admin (or Owner)

**Response (200):**

```json
[
  {
    "id": "log-uuid-1",
    "action": "CREATE",
    "userId": "user-uuid",
    "resource": "Task",
    "resourceId": "task-uuid",
    "details": "Created task: Build Login UI",
    "timestamp": "2026-01-30T10:00:00.000Z"
  },
  {
    "id": "log-uuid-2",
    "action": "UPDATE",
    "userId": "user-uuid",
    "resource": "Task",
    "resourceId": "task-uuid",
    "details": "Updated task: Build Login UI",
    "timestamp": "2026-01-30T12:00:00.000Z"
  },
  {
    "id": "log-uuid-3",
    "action": "DELETE",
    "userId": "admin-uuid",
    "resource": "Task",
    "resourceId": "task-uuid-old",
    "details": "Deleted task: Old Feature",
    "timestamp": "2026-01-30T14:00:00.000Z"
  }
]
```

**Error (403):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## Error Codes

| Status Code | Meaning                                 |
| ----------- | --------------------------------------- |
| 200         | Success                                 |
| 201         | Created                                 |
| 400         | Bad Request (validation error)          |
| 401         | Unauthorized (missing or invalid token) |
| 403         | Forbidden (insufficient permissions)    |
| 404         | Not Found                               |
| 500         | Internal Server Error                   |

---

## RBAC Rules Summary

| Endpoint               | Viewer | Admin | Owner |
| ---------------------- | ------ | ----- | ----- |
| `GET /tasks`           | ✅     | ✅    | ✅    |
| `POST /tasks`          | ❌     | ✅    | ✅    |
| `PUT /tasks/:id`       | ❌     | ✅    | ✅    |
| `DELETE /tasks/:id`    | ❌     | ✅    | ✅    |
| `GET /tasks/audit-log` | ❌     | ✅    | ✅    |

**Note:** Owners have all Admin permissions plus access to child organization data.

---

## Testing with cURL

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Get Tasks

```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "category": "Work"
  }'
```

### Update Task

```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "Done"}'
```

### Delete Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Audit Logs

```bash
curl -X GET http://localhost:3000/api/tasks/audit-log \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
