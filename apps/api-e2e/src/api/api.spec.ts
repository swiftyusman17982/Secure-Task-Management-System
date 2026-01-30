import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { UserRole } from 'secure-task-management-system/data';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/api/auth/login (POST) - should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.username).toBe('admin');
          expect(res.body.user.role).toBe(UserRole.ADMIN);
          authToken = res.body.accessToken;
        });
    });

    it('/api/auth/login (POST) - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);
    });

    it('/api/auth/profile (GET) - should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.username).toBe('admin');
          expect(res.body.role).toBe(UserRole.ADMIN);
        });
    });

    it('/api/auth/profile (GET) - should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });
  });

  describe('Tasks', () => {
    it('/api/tasks (POST) - should create task with valid token', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          category: 'Work',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Task');
          taskId = res.body.id;
        });
    });

    it('/api/tasks (POST) - should reject without token', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          category: 'Work',
        })
        .expect(401);
    });

    it('/api/tasks (GET) - should list tasks for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('/api/tasks/:id (PUT) - should update task', () => {
      return request(app.getHttpServer())
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
          status: 'Done',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Task');
          expect(res.body.status).toBe('Done');
        });
    });

    it('/api/tasks/:id (DELETE) - should delete task', () => {
      return request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('RBAC - Role-Based Access Control', () => {
    let viewerToken: string;

    it('should login as viewer', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'viewer', password: 'password123' })
        .expect(201)
        .expect((res) => {
          viewerToken = res.body.accessToken;
        });
    });

    it('should allow viewer to read tasks', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
    });

    it('should deny viewer from creating tasks', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          title: 'Viewer Task',
          description: 'Should fail',
          category: 'Work',
        })
        .expect(403);
    });
  });

  describe('Audit Logs', () => {
    it('/api/tasks/audit-log (GET) - should return audit logs for admin', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/audit-log')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/api/tasks/audit-log (GET) - should deny viewer access to audit logs', async () => {
      const viewerRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'viewer', password: 'password123' });

      return request(app.getHttpServer())
        .get('/api/tasks/audit-log')
        .set('Authorization', `Bearer ${viewerRes.body.accessToken}`)
        .expect(403);
    });
  });
});
