
import { Component, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTaskDto, UpdateTaskDto, TaskCategory, TaskStatus, Task } from 'secure-task-management-system/data';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden scale-in duration-200 transform">
        <div class="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
          <h3 class="text-xl font-bold text-[var(--text-primary)]">{{ task ? 'Edit Task' : 'New Task' }}</h3>
          <button (click)="close.emit()" class="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-2xl">&times;</button>
        </div>

        <form (ngSubmit)="submit()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-[var(--text-muted)] mb-1">Title</label>
            <input 
              [(ngModel)]="formData.title" 
              name="title" 
              class="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="What needs to be done?"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-[var(--text-muted)] mb-1">Description</label>
            <textarea 
              [(ngModel)]="formData.description" 
              name="description" 
              rows="3"
              class="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="Add some details..."
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--text-muted)] mb-1">Category</label>
              <select 
                [(ngModel)]="formData.category" 
                name="category"
                class="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option [value]="TaskCategory.WORK">Work</option>
                <option [value]="TaskCategory.PERSONAL">Personal</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--text-muted)] mb-1">Status</label>
              <select 
                [(ngModel)]="formData.status" 
                name="status"
                class="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option [value]="TaskStatus.TODO">Todo</option>
                <option [value]="TaskStatus.IN_PROGRESS">In Progress</option>
                <option [value]="TaskStatus.DONE">Done</option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              (click)="close.emit()"
              class="px-5 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              {{ task ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .scale-in { animation: scale-in 0.2s ease-out; }
  `]
})
export class TaskModalComponent {
  @Input() task?: Task;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  TaskCategory = TaskCategory;
  TaskStatus = TaskStatus;

  formData = {
    title: '',
    description: '',
    category: TaskCategory.WORK,
    status: TaskStatus.TODO
  };

  ngOnInit() {
    if (this.task) {
      this.formData = {
        title: this.task.title,
        description: this.task.description,
        category: this.task.category,
        status: this.task.status
      };
    }
  }

  submit() {
    this.save.emit(this.formData);
  }
}
