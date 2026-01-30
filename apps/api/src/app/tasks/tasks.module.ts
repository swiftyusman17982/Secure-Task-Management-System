
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity, AuditLogEntity } from 'secure-task-management-system/entities';
import { AuthModule } from 'secure-task-management-system/auth';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
        imports: [
                TypeOrmModule.forFeature([TaskEntity, AuditLogEntity]),
                AuthModule,
        ],
        controllers: [TasksController],
        providers: [TasksService],
        exports: [TasksService],
})
export class TasksModule { }
