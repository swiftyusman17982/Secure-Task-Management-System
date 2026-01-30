
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity, AuditLogEntity } from 'secure-task-management-system/entities';
import { CreateTaskDto, UpdateTaskDto, UserRole } from 'secure-task-management-system/data';

@Injectable()
export class TasksService {
        constructor(
                @InjectRepository(TaskEntity)
                private taskRepository: Repository<TaskEntity>,
                @InjectRepository(AuditLogEntity)
                private auditLogRepository: Repository<AuditLogEntity>,
        ) { }

        async create(createTaskDto: CreateTaskDto, user: any) {
                const task = this.taskRepository.create({
                        ...createTaskDto,
                        ownerId: user.userId,
                        orgId: user.orgId,
                });
                const savedTask = await this.taskRepository.save(task);
                await this.log('CREATE', user.userId, 'Task', savedTask.id, `Created task: ${savedTask.title}`);
                return savedTask;
        }

        async findAll(user: any) {
                // Basic visibility scoping: Owners see everything in their org and below? 
                // The requirement says "List accessible tasks (scoped to role/org)"
                // Typically: Viewer/Admin/Owner see all tasks in their organization.
                return this.taskRepository.find({
                        where: { orgId: user.orgId },
                        order: { order: 'ASC', createdAt: 'DESC' },
                });
        }

        async update(id: string, updateTaskDto: UpdateTaskDto, user: any) {
                const task = await this.taskRepository.findOne({ where: { id, orgId: user.orgId } });
                if (!task) return null;

                Object.assign(task, updateTaskDto);
                const updatedTask = await this.taskRepository.save(task);
                await this.log('UPDATE', user.userId, 'Task', id, `Updated task: ${updatedTask.title}`);
                return updatedTask;
        }

        async delete(id: string, user: any) {
                const task = await this.taskRepository.findOne({ where: { id, orgId: user.orgId } });
                if (!task) return false;

                await this.taskRepository.remove(task);
                await this.log('DELETE', user.userId, 'Task', id, `Deleted task: ${task.title}`);
                return true;
        }

        async getAuditLogs(user: any) {
                // Only Owners/Admins should see this (handled by guard in controller)
                return this.auditLogRepository.find({
                        order: { timestamp: 'DESC' },
                });
        }

        private async log(action: string, userId: string, resource: string, resourceId: string, details: string) {
                console.log(`[Audit Log] ${action} by ${userId} on ${resource} ${resourceId}: ${details}`);
                const log = this.auditLogRepository.create({
                        action,
                        userId,
                        resource,
                        resourceId,
                        details,
                });
                await this.auditLogRepository.save(log);
        }
}
