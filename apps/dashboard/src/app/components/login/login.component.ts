
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-indigo-500/30">
      <!-- Background elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="w-full max-w-md p-8 relative">
        <div class="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl overflow-hidden group">
          <!-- Glass effect highlight -->
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

          <div class="mb-10 text-center">
            <h1 class="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">Secure Task</h1>
            <p class="text-[var(--text-muted)]">Unlock your productivity</p>
          </div>

          <form (ngSubmit)="onLogin()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Username</label>
              <input 
                type="text" 
                [(ngModel)]="username" 
                name="username"
                class="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-[var(--text-main)] placeholder-slate-500"
                placeholder="Enter your username"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--text-muted)] mb-2">Password</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password"
                class="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-[var(--text-main)] placeholder-slate-500"
                placeholder="Enter your password"
                required
              >
            </div>

            <div *ngIf="error()" class="text-pink-500 text-sm text-center animate-pulse">
              {{ error() }}
            </div>

            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <span *ngIf="loading()" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ loading() ? 'Authenticating...' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-8 text-center text-sm text-[var(--text-muted)]">
            Secure RBAC Integrated System
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set('Invalid credentials');
        this.loading.set(false);
      }
    });
  }
}
