
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'secure-task-management-system/data';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
        constructor(private reflector: Reflector) { }

        canActivate(context: ExecutionContext): boolean {
                const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
                        context.getHandler(),
                        context.getClass(),
                ]);
                if (!requiredRoles) {
                        return true;
                }
                const { user } = context.switchToHttp().getRequest();

                // Role inheritance logic: Owner > Admin > Viewer
                const roleHierarchy: Record<UserRole, number> = {
                        [UserRole.OWNER]: 3,
                        [UserRole.ADMIN]: 2,
                        [UserRole.VIEWER]: 1,
                };

                const userRoleValue = roleHierarchy[user.role as UserRole] || 0;

                return requiredRoles.some((role) => userRoleValue >= roleHierarchy[role]);
        }
}
