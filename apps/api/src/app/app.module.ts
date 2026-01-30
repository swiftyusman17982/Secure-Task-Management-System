
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, OrganizationEntity, TaskEntity, AuditLogEntity } from 'secure-task-management-system/entities';
import { AuthModule } from 'secure-task-management-system/auth';
import { TasksModule } from './tasks/tasks.module';
import { AuthController } from './auth/auth.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [UserEntity, OrganizationEntity, TaskEntity, AuditLogEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([UserEntity, OrganizationEntity, TaskEntity, AuditLogEntity]),
    AuthModule,
    TasksModule,
  ],
  controllers: [AuthController],
  providers: [SeedService],
})
export class AppModule { }
