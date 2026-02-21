import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page-header">
    <div>
      <div class="title-row">
        <h1 class="header-title-pill">{{ title }}</h1>
      </div>
      <p class="muted" *ngIf="subtitle">{{ subtitle }}</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-light icon-button sidebar-open-btn" (click)="toggleSidebar.emit()">|||</button>
      <button class="btn btn-light icon-button">N</button>
      <div class="dropdown">
        <button class="btn btn-light d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
          <span class="avatar">{{ (userName || 'U').slice(0, 2).toUpperCase() }}</span>
          <span class="d-none d-md-inline">{{ userName || 'User' }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li class="px-3 py-2">
            <div class="fw-semibold">{{ userName || 'User' }}</div>
            <div class="text-muted small">{{ userRole || 'User' }}</div>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <button class="dropdown-item" (click)="logout.emit()">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
  `
})
export class HeaderComponent {
  @Input() title = 'Dashboard';
  @Input() subtitle = '';
  @Input() userName = '';
  @Input() userRole = '';
  @Output() logout = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
}
