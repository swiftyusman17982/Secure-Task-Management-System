import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from 'secure-task-management-system/data';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any);

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockExecutionContext({ role: UserRole.VIEWER });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow Owner to access Admin-required endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockExecutionContext({ role: UserRole.OWNER });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow Admin to access Admin-required endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockExecutionContext({ role: UserRole.ADMIN });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny Viewer access to Admin-required endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockExecutionContext({ role: UserRole.VIEWER });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow all roles to access Viewer-required endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.VIEWER]);

      const ownerContext = createMockExecutionContext({ role: UserRole.OWNER });
      const adminContext = createMockExecutionContext({ role: UserRole.ADMIN });
      const viewerContext = createMockExecutionContext({ role: UserRole.VIEWER });

      expect(guard.canActivate(ownerContext)).toBe(true);
      expect(guard.canActivate(adminContext)).toBe(true);
      expect(guard.canActivate(viewerContext)).toBe(true);
    });

    it('should deny access for Owner-only endpoints to Admin and Viewer', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.OWNER]);

      const ownerContext = createMockExecutionContext({ role: UserRole.OWNER });
      const adminContext = createMockExecutionContext({ role: UserRole.ADMIN });
      const viewerContext = createMockExecutionContext({ role: UserRole.VIEWER });

      expect(guard.canActivate(ownerContext)).toBe(true);
      expect(guard.canActivate(adminContext)).toBe(false);
      expect(guard.canActivate(viewerContext)).toBe(false);
    });
  });
});
