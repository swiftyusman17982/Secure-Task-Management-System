
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskStatus, TaskCategory, UserRole } from 'secure-task-management-system/data';
import { TaskModalComponent } from '../task-modal/task-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskModalComponent],
  template: `
    <div class="h-full flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
          <button 
            (click)="filterCategory.set(null)"
            [class]="!filterCategory() ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'"
            class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
          >
            All
          </button>
          <button 
            (click)="filterCategory.set(TaskCategory.WORK)"
            [class]="filterCategory() === TaskCategory.WORK ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'"
            class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
          >
            Work
          </button>
          <button 
            (click)="filterCategory.set(TaskCategory.PERSONAL)"
            [class]="filterCategory() === TaskCategory.PERSONAL ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'"
            class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
          >
            Personal
          </button>
        </div>

        <button 
          *ngIf="canManage()"
          (click)="showCreateModal.set(true)"
          class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 sm:py-2.5 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <span class="text-xl text-indigo-300">+</span> New Task
        </button>
      </div>

      <!-- Task Stats Visualization -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Overall Progress</span>
            <span class="text-xs font-bold text-indigo-400">{{ completionRate() }}%</span>
          </div>
          <div class="h-2 w-full bg-slate-700/30 rounded-full overflow-hidden">
            <div 
              class="h-full bg-indigo-500 transition-all duration-1000 ease-out"
              [style.width.%]="completionRate()"
            ></div>
          </div>
        </div>

        <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col justify-center min-h-[80px]">
          <div *ngIf="taskService.tasks().length > 0; else noTasksChart" class="flex items-end gap-2 h-16">
            <div class="flex-1 flex flex-col justify-end gap-1 group h-full">
              <div class="bg-indigo-500/30 rounded-t-md transition-all group-hover:bg-indigo-500/60 border-x border-t border-indigo-500/20" [style.height.%]="(todoTasks().length / taskService.tasks().length) * 100"></div>
              <span class="text-[10px] text-center text-[var(--text-muted)] font-bold">TODO ({{ todoTasks().length }})</span>
            </div>
            <div class="flex-1 flex flex-col justify-end gap-1 group h-full">
              <div class="bg-amber-500/30 rounded-t-md transition-all group-hover:bg-amber-500/60 border-x border-t border-amber-500/20" [style.height.%]="(inProgressTasks().length / taskService.tasks().length) * 100"></div>
              <span class="text-[10px] text-center text-[var(--text-muted)] font-bold">DOING ({{ inProgressTasks().length }})</span>
            </div>
            <div class="flex-1 flex flex-col justify-end gap-1 group h-full">
              <div class="bg-emerald-500/30 rounded-t-md transition-all group-hover:bg-emerald-500/60 border-x border-t border-emerald-500/20" [style.height.%]="(doneTasks().length / taskService.tasks().length) * 100"></div>
              <span class="text-[10px] text-center text-[var(--text-muted)] font-bold">DONE ({{ doneTasks().length }})</span>
            </div>
          </div>
          <ng-template #noTasksChart>
            <div class="text-center text-[var(--text-muted)] text-xs italic py-2">Create tasks to see distribution</div>
          </ng-template>
        </div>
      </div>

      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-0" cdkDropListGroup>
        <div class="flex flex-col gap-4">
          <h3 class="flex items-center gap-2 font-bold text-[var(--text-muted)] uppercase tracking-widest text-xs px-2">
            <span class="w-2 h-2 rounded-full bg-slate-500"></span> Todo ({{ todoTasks().length }})
          </h3>
          <div 
            id="Todo"
            cdkDropList
            [cdkDropListData]="todoTasks()"
            (cdkDropListDropped)="drop($event)"
            class="flex-1 bg-[var(--bg-sidebar)] rounded-3xl p-4 border border-[var(--border-color)] flex flex-col gap-3 min-h-[150px]"
          >
            <ng-container *ngFor="let task of todoTasks()">
              <div cdkDrag [cdkDragDisabled]="!canManage()" class="task-card">
                <ng-container *ngTemplateOutlet="taskTemplate; context: { $implicit: task }"></ng-container>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="flex items-center gap-2 font-bold text-[var(--text-muted)] uppercase tracking-widest text-xs px-2">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span> In Progress ({{ inProgressTasks().length }})
          </h3>
          <div 
            id="In Progress"
            cdkDropList
            [cdkDropListData]="inProgressTasks()"
            (cdkDropListDropped)="drop($event)"
            class="flex-1 bg-[var(--bg-sidebar)] rounded-3xl p-4 border border-[var(--border-color)] flex flex-col gap-3 min-h-[150px]"
          >
            <ng-container *ngFor="let task of inProgressTasks()">
              <div cdkDrag [cdkDragDisabled]="!canManage()" class="task-card">
                <ng-container *ngTemplateOutlet="taskTemplate; context: { $implicit: task }"></ng-container>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="flex items-center gap-2 font-bold text-[var(--text-muted)] uppercase tracking-widest text-xs px-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Done ({{ doneTasks().length }})
          </h3>
          <div 
            id="Done"
            cdkDropList
            [cdkDropListData]="doneTasks()"
            (cdkDropListDropped)="drop($event)"
            class="flex-1 bg-[var(--bg-sidebar)] rounded-3xl p-4 border border-[var(--border-color)] flex flex-col gap-3 min-h-[150px]"
          >
            <ng-container *ngFor="let task of doneTasks()">
              <div cdkDrag [cdkDragDisabled]="!canManage()" class="task-card">
                <ng-container *ngTemplateOutlet="taskTemplate; context: { $implicit: task }"></ng-container>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>

    <ng-template #taskTemplate let-task>
      <div class="group bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-4 rounded-2xl border border-[var(--border-color)] hover:border-indigo-500/30 transition-all cursor-move shadow-md">
        <div class="flex justify-between items-start mb-2">
          <span [class]="task.category === TaskCategory.WORK ? 'bg-purple-500/10 text-purple-400' : 'bg-pink-500/10 text-pink-400'" class="px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider">
            {{ task.category }}
          </span>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button (click)="editTask(task)" *ngIf="canManage()" class="p-1.5 hover:bg-slate-700/50 rounded-lg text-xs" title="Edit">✏️</button>
            <button (click)="deleteTask(task.id)" *ngIf="canManage()" class="p-1.5 hover:bg-pink-600/20 text-pink-400 rounded-lg text-xs" title="Delete">🗑️</button>
          </div>
        </div>
        <h4 class="font-semibold mb-1 group-hover:text-indigo-400 transition-colors">{{ task.title }}</h4>
        <p class="text-xs text-[var(--text-muted)] line-clamp-2">{{ task.description }}</p>
      </div>
    </ng-template>

    <app-task-modal 
      *ngIf="showCreateModal()" 
      (close)="showCreateModal.set(false)"
      (save)="createTask($event)"
    ></app-task-modal>

    <app-task-modal 
      *ngIf="editingTask()" 
      [task]="editingTask()!"
      (close)="editingTask.set(null)"
      (save)="updateTask($event)"
    ></app-task-modal>
  `,
  styles: [`
    .cdk-drop-list-dragging .task-card { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .cdk-drag-preview {
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
      cursor: grabbing;
      opacity: 0.9;
      transform: scale(1.05);
    }
    .cdk-drag-placeholder { opacity: 0.1; }
  `]
})
export class TaskListComponent implements OnInit {
  taskService = inject(TaskService);
  authService = inject(AuthService);

  TaskCategory = TaskCategory;
  filterCategory = signal<TaskCategory | null>(null);
  showCreateModal = signal(false);
  editingTask = signal<Task | null>(null);

  canManage = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === UserRole.ADMIN || role === UserRole.OWNER;
  });

  filteredTasks = computed(() => {
    let tasks = this.taskService.tasks();
    const cat = this.filterCategory();
    if (cat) {
      tasks = tasks.filter(t => t.category === cat);
    }
    return tasks;
  });

  todoTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.TODO));
  inProgressTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.IN_PROGRESS));
  doneTasks = computed(() => this.filteredTasks().filter(t => t.status === TaskStatus.DONE));

  completionRate = computed(() => {
    const total = this.taskService.tasks().length;
    if (total === 0) return 0;
    const done = this.taskService.tasks().filter(t => t.status === TaskStatus.DONE).length;
    return Math.round((done / total) * 100);
  });

  ngOnInit() {
    this.taskService.loadTasks();
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within same column? We don't implement full reordering yet
      // but the UI requires moveItemInArray for the list to look right
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id as TaskStatus;
      this.taskService.updateTask(task.id, { status: newStatus }).subscribe();
    }
  }

  createTask(dto: any) {
    this.taskService.createTask(dto).subscribe(() => {
      this.showCreateModal.set(false);
    });
  }

  editTask(task: Task) {
    this.editingTask.set(task);
  }

  updateTask(dto: any) {
    if (this.editingTask()) {
      this.taskService.updateTask(this.editingTask()!.id, dto).subscribe(() => {
        this.editingTask.set(null);
      });
    }
  }

  deleteTask(id: string) {
    if (confirm('Are you sure?')) {
      this.taskService.deleteTask(id).subscribe();
    }
  }
}
