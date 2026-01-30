import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { ThemeService } from '../../services/theme.service';
import { TaskListComponent } from '../task-list/task-list.component';
import { AuditLogComponent } from '../audit-log/audit-log.component';
import { UserRole } from 'secure-task-management-system/data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskListComponent, AuditLogComponent, RouterModule],
  template: `
    <div class="flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden flex-col md:flex-row">
      <!-- Mobile Header -->
      <header class="md:hidden h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-color)] px-4 flex items-center justify-between z-50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center font-bold text-lg">S</div>
          <span class="text-lg font-bold tracking-tight">SecureTask</span>
        </div>
        <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
          <span class="text-2xl">{{ mobileMenuOpen() ? '✕' : '☰' }}</span>
        </button>
      </header>

      <!-- Sidebar -->
      <aside 
        [class.translate-x-0]="mobileMenuOpen()"
        [class.-translate-x-full]="!mobileMenuOpen()"
        class="fixed inset-y-0 left-0 w-72 bg-[var(--bg-sidebar)] md:bg-[var(--bg-sidebar)] backdrop-blur-xl border-r border-[var(--border-color)] flex flex-col p-6 z-40 transition-transform duration-300 md:relative md:translate-x-0"
      >
        <div class="hidden md:flex mb-10 items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center font-bold text-xl">S</div>
          <span class="text-xl font-bold tracking-tight">SecureTask</span>
        </div>

        <nav class="flex-1 space-y-2 mt-16 md:mt-0">
          <button 
            (click)="activeTab.set('tasks'); mobileMenuOpen.set(false)"
            [class]="activeTab() === 'tasks' ? 'bg-white/5 text-[var(--text-main)] border-l-4 border-indigo-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'"
            class="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3"
          >
            <span class="text-lg">📋</span> Tasks
          </button>
          <button 
            *ngIf="isAdmin()"
            (click)="activeTab.set('audit'); mobileMenuOpen.set(false)"
            [class]="activeTab() === 'audit' ? 'bg-white/5 text-[var(--text-main)] border-l-4 border-indigo-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'"
            class="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3"
          >
            <span class="text-lg">📜</span> Audit Logs
          </button>
        </nav>

        <div class="mt-auto pt-6 border-t border-[var(--border-color)] space-y-4">
          <!-- Theme Toggle -->
          <button 
            (click)="themeService.toggleTheme()"
            class="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
          >
            <span class="text-sm font-medium">Theme Mode</span>
            <span>{{ themeService.isDarkMode() ? '🌙' : '☀️' }}</span>
          </button>

          <div class="flex items-center gap-4 px-2">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold uppercase">
              {{ user()?.username?.substring(0, 1) }}
            </div>
            <div class="overflow-hidden">
              <p class="font-medium truncate">{{ user()?.username }}</p>
              <p class="text-xs text-indigo-400 font-semibold uppercase tracking-wider">{{ user()?.role }}</p>
            </div>
          </div>
          <button 
            (click)="logout()"
            class="w-full bg-[var(--bg-card)] hover:bg-pink-600/20 hover:text-pink-400 border border-[var(--border-color)] hover:border-pink-500/30 text-[var(--text-muted)] rounded-xl py-2 px-4 transition-all flex items-center justify-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header class="hidden md:flex h-20 border-b border-[var(--border-color)] px-8 items-center justify-between">
          <h2 class="text-2xl font-bold">{{ activeTab() === 'tasks' ? 'Task Management' : 'System Logs' }}</h2>
        </header>

        <section class="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <!-- Background Glows -->
          <div class="absolute top-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
          
          <div [ngSwitch]="activeTab()">
            <app-task-list *ngSwitchCase="'tasks'"></app-task-list>
            <app-audit-log *ngSwitchCase="'audit'"></app-audit-log>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  `]
})
export class DashboardComponent implements OnInit {
  activeTab = signal<'tasks' | 'audit'>('tasks');
  mobileMenuOpen = signal(false);

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  user = computed(() => this.authService.currentUser());
  isAdmin = computed(() => {
    const role = this.user()?.role;
    return role === UserRole.ADMIN || role === UserRole.OWNER;
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Shortcuts only when not in an input
    if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;

    if (event.key.toLowerCase() === 'n') {
      event.preventDefault();
      const taskList = document.querySelector('app-task-list');
      if (taskList) {
        const btn = taskList.querySelector('button.bg-indigo-600') as HTMLButtonElement;
        btn?.click();
      }
    }
  }

  ngOnInit() {
  }

  logout() {
    this.authService.logout();
  }
}
