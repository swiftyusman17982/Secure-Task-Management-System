
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from 'secure-task-management-system/auth';
import { UserRole, CreateTaskDto, UpdateTaskDto } from 'secure-task-management-system/data';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
        constructor(private tasksService: TasksService) { }

        @Post()
        @Roles(UserRole.ADMIN) // Admin and Owner (via inheritance) can create
        create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
                return this.tasksService.create(createTaskDto, req.user);
        }

        @Get()
        @Roles(UserRole.VIEWER) // Everyone can see tasks in their org
        findAll(@Request() req) {
                return this.tasksService.findAll(req.user);
        }

        @Put(':id')
        @Roles(UserRole.ADMIN)
        update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
                return this.tasksService.update(id, updateTaskDto, req.user);
        }

        @Delete(':id')
        @Roles(UserRole.ADMIN)
        delete(@Param('id') id: string, @Request() req) {
                return this.tasksService.delete(id, req.user);
        }

        @Get('audit-log')
        @Roles(UserRole.ADMIN) // Only Admin and Owner
        getAuditLogs(@Request() req) {
                return this.tasksService.getAuditLogs(req.user);
        }
}
