import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NavItem = { label: string; to: string; icon: string };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
  <aside class="sidebar" [class.collapsed]="collapsed">
    <div class="sidebar-top">
      <div class="logo">
        <img *ngIf="company?.logoUrl; else fallback" [src]="company?.logoUrl" alt="Company logo" class="logo-image" />
        <ng-template #fallback><div class="logo-mark">I</div></ng-template>
        <div class="logo-text">
          <strong>{{ company?.name || 'Inventra' }}</strong>
          <span class="muted">Control Center</span>
        </div>
      </div>
      <button type="button" class="sidebar-toggle" (click)="toggleCollapse.emit()">{{ collapsed ? '>' : '<' }}</button>
    </div>

    <nav class="sidebar-nav">
      <a *ngFor="let item of items"
         [routerLink]="item.to"
         routerLinkActive="active"
         [title]="collapsed ? item.label : ''"
         (click)="navigate.emit()">
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <span class="pill">v1.0</span>
      <span class="muted">All systems normal</span>
    </div>
  </aside>
  `
})
export class SidebarComponent {
  @Input() role = '';
  @Input() basePath = '/admin';
  @Input() collapsed = false;
  @Input() company: { name?: string; logoUrl?: string } | null = null;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<void>();

  get items(): NavItem[] {
    const isAdmin = this.role === 'admin' || this.role === 'super_admin';
    const isSeller = this.role === 'seller';
    const isBuyer = this.role === 'buyer';
    if (isAdmin) {
      return [
        { label: 'Dashboard', to: `${this.basePath}/dashboard`, icon: 'DB' },
        { label: 'Inventory', to: `${this.basePath}/inventory`, icon: 'IV' },
        { label: 'Adjustments', to: `${this.basePath}/adjustments`, icon: 'AD' },
        { label: 'Location Stock', to: `${this.basePath}/stock-locations`, icon: 'LS' },
        { label: 'Suppliers', to: `${this.basePath}/suppliers`, icon: 'SP' },
        { label: 'Customers', to: `${this.basePath}/customers`, icon: 'CU' },
        { label: 'Locations', to: `${this.basePath}/locations`, icon: 'LO' },
        { label: 'Purchase Orders', to: `${this.basePath}/purchase-orders`, icon: 'PO' },
        { label: 'Sales Orders', to: `${this.basePath}/sales-orders`, icon: 'SO' },
        { label: 'Returns', to: `${this.basePath}/returns`, icon: 'RT' },
        { label: 'Audit Logs', to: `${this.basePath}/audit-logs`, icon: 'AL' },
        { label: 'User Onboarding', to: `${this.basePath}/user-onboarding`, icon: 'UO' },
        { label: 'Company Settings', to: `${this.basePath}/company-settings`, icon: 'CS' }
      ];
    }
    if (isSeller) {
      return [
        { label: 'Dashboard', to: `${this.basePath}/dashboard`, icon: 'DB' },
        { label: 'Purchase Orders', to: `${this.basePath}/purchase-orders`, icon: 'PO' },
        { label: 'Profile', to: `${this.basePath}/profile`, icon: 'PR' }
      ];
    }
    if (isBuyer) {
      return [
        { label: 'Dashboard', to: `${this.basePath}/dashboard`, icon: 'DB' },
        { label: 'Sales Orders', to: `${this.basePath}/sales-orders`, icon: 'SO' },
        { label: 'Profile', to: `${this.basePath}/profile`, icon: 'PR' }
      ];
    }
    return [{ label: 'Dashboard', to: `${this.basePath}/dashboard`, icon: 'DB' }];
  }
}
