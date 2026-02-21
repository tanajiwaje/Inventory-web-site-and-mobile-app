import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginationMeta } from '../core/types';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="d-flex align-items-center justify-content-between mt-3" *ngIf="meta">
    <span class="text-muted">Page {{ meta.page }} of {{ meta.totalPages }}</span>
    <div class="btn-group">
      <button class="btn btn-outline-primary btn-sm" type="button" [disabled]="meta.page<=1" (click)="pageChange.emit(meta.page-1)">Prev</button>
      <button class="btn btn-outline-primary btn-sm" type="button" [disabled]="meta.page>=meta.totalPages" (click)="pageChange.emit(meta.page+1)">Next</button>
    </div>
  </div>
  `
})
export class PaginationComponent {
  @Input() meta!: PaginationMeta;
  @Output() pageChange = new EventEmitter<number>();
}
