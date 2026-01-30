
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, CreateTaskDto, UpdateTaskDto, AuditLog } from 'secure-task-management-system/data';
import { tap } from 'rxjs/operators';

@Injectable({
        providedIn: 'root'
})
export class TaskService {
        private readonly API_URL = 'http://localhost:3000/api/tasks';

        tasks = signal<Task[]>([]);

        constructor(private http: HttpClient) { }

        loadTasks() {
                return this.http.get<Task[]>(this.API_URL).pipe(
                        tap(tasks => this.tasks.set(tasks))
                ).subscribe();
        }

        createTask(dto: CreateTaskDto) {
                return this.http.post<Task>(this.API_URL, dto).pipe(
                        tap(() => this.loadTasks())
                );
        }

        updateTask(id: string, dto: UpdateTaskDto) {
                return this.http.put<Task>(`${this.API_URL}/${id}`, dto).pipe(
                        tap(() => this.loadTasks())
                );
        }

        deleteTask(id: string) {
                return this.http.delete(`${this.API_URL}/${id}`).pipe(
                        tap(() => this.loadTasks())
                );
        }

        getAuditLogs() {
                return this.http.get<AuditLog[]>(`${this.API_URL}/audit-log`);
        }
}
