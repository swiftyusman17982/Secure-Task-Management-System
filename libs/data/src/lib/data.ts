
export enum UserRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  VIEWER = 'Viewer',
}

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  children?: Organization[];
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  orgId: string;
  organization?: Organization;
}

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  ownerId: string;
  orgId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  category: TaskCategory;
  status?: TaskStatus;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  order?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  details?: string;
}
