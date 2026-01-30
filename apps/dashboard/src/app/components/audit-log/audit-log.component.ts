
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuditLog } from 'secure-task-management-system/data';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col gap-6">
      <div class="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[600px] md:min-w-0">
          <thead>
            <tr class="bg-indigo-600/10 border-b border-[var(--border-color)]">
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Timestamp</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Action</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Resource</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border-color)]">
            <tr *ngFor="let log of logs()" class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-4 text-sm text-[var(--text-muted)] whitespace-nowrap">{{ log.timestamp | date:'short' }}</td>
              <td class="px-6 py-4">
                <span [ngClass]="{
                  'bg-emerald-500/10 text-emerald-400': log.action === 'CREATE',
                  'bg-amber-500/10 text-amber-400': log.action === 'UPDATE',
                  'bg-pink-500/10 text-pink-400': log.action === 'DELETE'
                }" class="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium">{{ log.resource }}</td>
              <td class="px-6 py-4 text-sm text-slate-300">{{ log.details }}</td>
            </tr>
            <tr *ngIf="logs().length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-slate-500 italic">No logs found yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AuditLogComponent implements OnInit {
  taskService = inject(TaskService);
  logs = signal<AuditLog[]>([]);

  ngOnInit() {
    this.taskService.getAuditLogs().subscribe(logs => this.logs.set(logs));
  }
}
