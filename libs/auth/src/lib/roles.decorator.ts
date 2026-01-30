
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'secure-task-management-system/data';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
