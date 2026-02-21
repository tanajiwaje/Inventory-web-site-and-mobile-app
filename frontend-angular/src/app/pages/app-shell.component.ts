import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { notify } from '../core/notify';
import { AdminApiService } from '../core/services/admin-api.service';
import { AuditApiService } from '../core/services/audit-api.service';
import { AuthApiService } from '../core/services/auth-api.service';
import { EntitiesApiService } from '../core/services/entities-api.service';
import { InventoryApiService } from '../core/services/inventory-api.service';
import { PaginationMeta } from '../core/types';
import { HeaderComponent } from '../layout/header.component';
import { SidebarComponent } from '../layout/sidebar.component';
import { PaginationComponent } from '../shared/pagination.component';

const PAGE_SIZE = 10;
const blankPage = (): PaginationMeta => ({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, PaginationComponent],
  template: `
  <div class="app-shell" [class.sidebar-collapsed]="sidebarCollapsed" [class.sidebar-open]="sidebarOpen" [class.role-admin]="isAdmin" [class.role-seller]="isSeller" [class.role-buyer]="isBuyer">
    <app-sidebar [role]="role" [basePath]="basePath" [company]="companySettings" [collapsed]="sidebarCollapsed" (toggleCollapse)="toggleCollapse()" (navigate)="sidebarOpen=false" />
    <button type="button" class="sidebar-backdrop" [class.show]="sidebarOpen" (click)="sidebarOpen=false"></button>
    <div class="app"><div class="container-fluid">
      <app-header [title]="headerTitle" [subtitle]="headerSubtitle" [userName]="auth.user()?.name || ''" [userRole]="auth.user()?.role || ''" (logout)="logout()" (toggleSidebar)="sidebarOpen=!sidebarOpen" />
      <div *ngIf="error" class="banner error">{{ error }}</div>

      <section class="section" *ngIf="activeSection==='dashboard'">
        <div class="section-title"><h2>Dashboard</h2><span class="muted">Overview</span></div>
        <div class="stats">
          <div class="stat"><span class="label">Inventory</span><strong>{{ dashboard?.inventory?.summary?.totalItems || items.length }}</strong></div>
          <div class="stat"><span class="label">Suppliers</span><strong>{{ dashboard?.suppliers?.count || suppliers.length }}</strong></div>
          <div class="stat"><span class="label">Customers</span><strong>{{ dashboard?.customers?.count || customers.length }}</strong></div>
          <div class="stat"><span class="label">Profit</span><strong>{{ dashboard?.profit?.net || 0 }}</strong></div>
        </div>
      </section>

      <section class="section" *ngIf="showInventory && activeSection==='inventory'">
        <div class="section-title"><h2>Inventory</h2><span class="muted">Core stock catalog</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4" *ngIf="isAdmin">
            <div class="card grid">
              <input class="form-control" [(ngModel)]="itemForm.name" placeholder="Name" />
              <input class="form-control" [(ngModel)]="itemForm.sku" placeholder="SKU" />
              <input class="form-control" type="number" [(ngModel)]="itemForm.quantity" placeholder="Quantity" />
              <input class="form-control" type="number" [(ngModel)]="itemForm.cost" placeholder="Cost" />
              <input class="form-control" type="number" [(ngModel)]="itemForm.price" placeholder="Price" />
              <button class="btn btn-primary" (click)="saveItem()">{{ editingItemId ? 'Update' : 'Create' }}</button>
            </div>
          </div>
          <div class="col-12" [class.col-lg-8]="isAdmin">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Name</th><th>SKU</th><th>Qty</th><th>Cost</th><th>Price</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let item of items">
                    <td>{{ item.name }}</td><td>{{ item.sku }}</td><td>{{ item.quantity }}</td><td>{{ item.cost }}</td><td>{{ item.price }}</td>
                    <td class="actions-cell" *ngIf="isAdmin"><button class="btn btn-sm btn-outline-primary" (click)="startEditItem(item)">Edit</button><button class="btn btn-sm btn-outline-danger" (click)="deleteItem(item._id)">Delete</button></td>
                  </tr>
                  <tr *ngIf="!items.length"><td colspan="6">No items.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="itemsPage" (pageChange)="loadItems($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="activeSection==='adjustments' && showAdjustments">
        <div class="section-title"><h2>Adjustments</h2><span class="muted">Track stock movement</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4">
            <div class="card grid">
              <select class="form-select" [(ngModel)]="adjustForm.itemId"><option value="">Select item</option><option *ngFor="let item of items" [value]="item._id">{{ item.name }}</option></select>
              <select class="form-select" [(ngModel)]="adjustForm.type"><option value="receive">Receive</option><option value="issue">Issue</option><option value="adjust">Adjust</option></select>
              <input class="form-control" type="number" [(ngModel)]="adjustForm.quantity" placeholder="Quantity" />
              <input class="form-control" [(ngModel)]="adjustForm.reason" placeholder="Reason" />
              <button class="btn btn-primary" (click)="applyAdjustment()">Apply</button>
            </div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Item</th><th>Type</th><th>Change</th><th>Time</th></tr></thead>
                <tbody>
                  <tr *ngFor="let tx of transactions"><td>{{ tx.item.name }}</td><td>{{ tx.type }}</td><td>{{ tx.quantityChange }}</td><td>{{ tx.createdAt | date:'medium' }}</td></tr>
                  <tr *ngIf="!transactions.length"><td colspan="4">No transactions.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="transactionsPage" (pageChange)="loadTransactions($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="activeSection==='stock-locations' && showStockLocations">
        <div class="section-title"><h2>Location Stock</h2><span class="muted">Quantities by location</span></div>
        <div class="card table-wrap">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead><tr><th>Item</th><th>SKU</th><th>Location</th><th>Qty</th></tr></thead>
            <tbody>
              <tr *ngFor="let row of stocks"><td>{{ row.item.name }}</td><td>{{ row.item.sku }}</td><td>{{ row.location.name }}</td><td>{{ row.quantity }}</td></tr>
              <tr *ngIf="!stocks.length"><td colspan="4">No stock rows.</td></tr>
            </tbody>
          </table>
          <app-pagination [meta]="stocksPage" (pageChange)="loadStocks($event)" />
        </div>
      </section>

      <section class="section" *ngIf="showSuppliers && activeSection==='suppliers'">
        <div class="section-title"><h2>Suppliers</h2><span class="muted">Manage suppliers</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4">
            <div class="card grid">
              <input class="form-control" [(ngModel)]="supplierForm.name" placeholder="Supplier name" />
              <input class="form-control" [(ngModel)]="supplierForm.contactName" placeholder="Contact name" />
              <input class="form-control" [(ngModel)]="supplierForm.phone" placeholder="Phone" />
              <input class="form-control" [(ngModel)]="supplierForm.email" placeholder="Email" />
              <input class="form-control" [(ngModel)]="supplierForm.address" placeholder="Address" />
              <div class="actions d-flex gap-2">
                <button class="btn btn-primary" (click)="saveSupplier()">{{ editingSupplierId ? 'Update Supplier' : 'Add Supplier' }}</button>
                <button class="btn btn-outline-secondary" *ngIf="editingSupplierId" (click)="cancelSupplierEdit()">Cancel</button>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let row of suppliers">
                    <td>{{ row.name }}</td><td>{{ row.contactName || '-' }}</td><td>{{ row.phone || '-' }}</td><td>{{ row.email || '-' }}</td>
                    <td class="actions-cell"><button class="btn btn-sm btn-outline-primary" (click)="startEditSupplier(row)">Edit</button><button class="btn btn-sm btn-outline-danger" (click)="deleteSupplier(row._id)">Delete</button></td>
                  </tr>
                  <tr *ngIf="!suppliers.length"><td colspan="5">No suppliers.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="suppliersPage" (pageChange)="loadSuppliers($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="showCustomers && activeSection==='customers'">
        <div class="section-title"><h2>Customers</h2><span class="muted">Manage customers</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4">
            <div class="card grid">
              <input class="form-control" [(ngModel)]="customerForm.name" placeholder="Customer name" />
              <input class="form-control" [(ngModel)]="customerForm.contactName" placeholder="Contact name" />
              <input class="form-control" [(ngModel)]="customerForm.phone" placeholder="Phone" />
              <input class="form-control" [(ngModel)]="customerForm.email" placeholder="Email" />
              <input class="form-control" [(ngModel)]="customerForm.address" placeholder="Address" />
              <div class="actions d-flex gap-2">
                <button class="btn btn-primary" (click)="saveCustomer()">{{ editingCustomerId ? 'Update Customer' : 'Add Customer' }}</button>
                <button class="btn btn-outline-secondary" *ngIf="editingCustomerId" (click)="cancelCustomerEdit()">Cancel</button>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let row of customers">
                    <td>{{ row.name }}</td><td>{{ row.contactName || '-' }}</td><td>{{ row.phone || '-' }}</td><td>{{ row.email || '-' }}</td>
                    <td class="actions-cell"><button class="btn btn-sm btn-outline-primary" (click)="startEditCustomer(row)">Edit</button><button class="btn btn-sm btn-outline-danger" (click)="deleteCustomer(row._id)">Delete</button></td>
                  </tr>
                  <tr *ngIf="!customers.length"><td colspan="5">No customers.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="customersPage" (pageChange)="loadCustomers($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="showLocations && activeSection==='locations'">
        <div class="section-title"><h2>Locations</h2><span class="muted">Manage locations</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4">
            <div class="card grid">
              <input class="form-control" [(ngModel)]="locationForm.name" placeholder="Location name" />
              <input class="form-control" [(ngModel)]="locationForm.code" placeholder="Location code" />
              <input class="form-control" [(ngModel)]="locationForm.address" placeholder="Address" />
              <label class="form-check">
                <input class="form-check-input" type="checkbox" [(ngModel)]="locationForm.isDefault" />
                <span class="form-check-label">Default location</span>
              </label>
              <div class="actions d-flex gap-2">
                <button class="btn btn-primary" (click)="saveLocation()">{{ editingLocationId ? 'Update Location' : 'Add Location' }}</button>
                <button class="btn btn-outline-secondary" *ngIf="editingLocationId" (click)="cancelLocationEdit()">Cancel</button>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Name</th><th>Code</th><th>Default</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let row of locations">
                    <td>{{ row.name }}</td><td>{{ row.code || '-' }}</td><td>{{ row.isDefault ? 'Yes' : 'No' }}</td>
                    <td class="actions-cell"><button class="btn btn-sm btn-outline-primary" (click)="startEditLocation(row)">Edit</button><button class="btn btn-sm btn-outline-danger" (click)="deleteLocation(row._id)">Delete</button></td>
                  </tr>
                  <tr *ngIf="!locations.length"><td colspan="4">No locations.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="locationsPage" (pageChange)="loadLocations($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="showPurchaseOrders && activeSection==='purchase-orders'">
        <div class="section-title"><h2>Purchase Orders</h2><span class="muted">Manage purchase orders</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4" *ngIf="isAdmin">
            <div class="card grid">
              <select class="form-select" [(ngModel)]="purchaseForm.supplier"><option value="">Select supplier</option><option *ngFor="let s of suppliers" [value]="s._id">{{ s.name }}</option></select>
              <select class="form-select" [(ngModel)]="purchaseForm.status"><option value="requested">Requested</option><option value="approved">Approved</option><option value="received">Received</option></select>
              <select class="form-select" [(ngModel)]="purchaseForm.itemId"><option value="">Select item</option><option *ngFor="let item of items" [value]="item._id">{{ item.name }} ({{ item.sku }})</option></select>
              <input class="form-control" type="number" min="1" [(ngModel)]="purchaseForm.quantity" placeholder="Quantity" />
              <input class="form-control" type="number" min="0" [(ngModel)]="purchaseForm.cost" placeholder="Unit cost" />
              <input class="form-control" type="date" [(ngModel)]="purchaseForm.expectedDate" placeholder="Expected date" />
              <input class="form-control" [(ngModel)]="purchaseForm.notes" placeholder="Notes" />
              <button class="btn btn-primary" (click)="createPurchaseOrder()">Create Purchase Order</button>
            </div>
          </div>
          <div class="col-12" [class.col-lg-8]="isAdmin">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Supplier</th><th>Status</th><th>Items</th><th>PDF</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let row of purchaseOrders">
                    <td>{{ row.supplier?.name }}</td>
                    <td>
                      <select class="form-select form-select-sm" [ngModel]="row.status" (ngModelChange)="updatePurchaseStatus(row._id, $event)">
                        <option value="requested">Requested</option>
                        <option value="supplier_submitted">Supplier Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="received">Received</option>
                      </select>
                    </td>
                    <td>{{ row.items.length }}</td>
                    <td class="actions-cell"><button class="btn btn-sm btn-outline-primary" (click)="viewPurchasePdf(row._id)">View</button><button class="btn btn-sm btn-outline-secondary" (click)="downloadPurchasePdf(row._id)">Download</button></td>
                    <td class="actions-cell" *ngIf="isAdmin"><button class="btn btn-sm btn-outline-danger" (click)="deletePurchaseOrder(row._id)">Delete</button></td>
                  </tr>
                  <tr *ngIf="!purchaseOrders.length"><td colspan="5">No purchase orders.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="purchaseOrdersPage" (pageChange)="loadPurchaseOrders($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="showSalesOrders && activeSection==='sales-orders'">
        <div class="section-title"><h2>Sales Orders</h2><span class="muted">Manage sales orders</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4">
            <div class="card grid">
              <select class="form-select" [(ngModel)]="salesForm.customer"><option value="">Select customer</option><option *ngFor="let c of customers" [value]="c._id">{{ c.name }}</option></select>
              <select class="form-select" [(ngModel)]="salesForm.status"><option value="requested">Requested</option><option value="approved">Approved</option><option value="received">Received</option></select>
              <select class="form-select" [(ngModel)]="salesForm.itemId"><option value="">Select item</option><option *ngFor="let item of items" [value]="item._id">{{ item.name }} ({{ item.sku }})</option></select>
              <input class="form-control" type="number" min="1" [(ngModel)]="salesForm.quantity" placeholder="Quantity" />
              <input class="form-control" type="number" min="0" [(ngModel)]="salesForm.price" placeholder="Unit price" />
              <input class="form-control" type="date" [(ngModel)]="salesForm.deliveryDate" placeholder="Delivery date" />
              <input class="form-control" [(ngModel)]="salesForm.notes" placeholder="Notes" />
              <button class="btn btn-primary" (click)="createSalesOrder()">Create Sales Order</button>
            </div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Customer</th><th>Status</th><th>Items</th><th>PDF</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let row of salesOrders">
                    <td>{{ row.customer?.name }}</td>
                    <td>
                      <select class="form-select form-select-sm" [ngModel]="row.status" (ngModelChange)="updateSalesStatus(row._id, $event)">
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="received">Received</option>
                      </select>
                    </td>
                    <td>{{ row.items.length }}</td>
                    <td class="actions-cell"><button class="btn btn-sm btn-outline-primary" (click)="viewSalesPdf(row._id)">View</button><button class="btn btn-sm btn-outline-secondary" (click)="downloadSalesPdf(row._id)">Download</button></td>
                    <td class="actions-cell"><button class="btn btn-sm btn-outline-danger" (click)="deleteSalesOrder(row._id)">Delete</button></td>
                  </tr>
                  <tr *ngIf="!salesOrders.length"><td colspan="5">No sales orders.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="salesOrdersPage" (pageChange)="loadSalesOrders($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="showReturns && activeSection==='returns'">
        <div class="section-title"><h2>Returns</h2><span class="muted">Manage returns</span></div>
        <div class="row g-4">
          <div class="col-12 col-lg-4">
            <div class="card grid">
              <select class="form-select" [(ngModel)]="returnForm.type"><option value="customer">Customer Return</option><option value="supplier">Supplier Return</option></select>
              <select class="form-select" [(ngModel)]="returnForm.status"><option value="requested">Requested</option><option value="received">Received</option><option value="closed">Closed</option></select>
              <select class="form-select" [(ngModel)]="returnForm.itemId"><option value="">Select item</option><option *ngFor="let item of items" [value]="item._id">{{ item.name }} ({{ item.sku }})</option></select>
              <input class="form-control" type="number" min="1" [(ngModel)]="returnForm.quantity" placeholder="Quantity" />
              <input class="form-control" [(ngModel)]="returnForm.reason" placeholder="Reason" />
              <input class="form-control" [(ngModel)]="returnForm.notes" placeholder="Notes" />
              <button class="btn btn-primary" (click)="createReturn()">Create Return</button>
            </div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="card table-wrap">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead><tr><th>Type</th><th>Status</th><th>Items</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let row of returns">
                    <td>{{ row.type }}</td>
                    <td>
                      <select class="form-select form-select-sm" [ngModel]="row.status" (ngModelChange)="updateReturnStatus(row._id, $event)">
                        <option value="requested">Requested</option>
                        <option value="received">Received</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td>{{ row.items.length }}</td>
                    <td class="actions-cell"><button class="btn btn-sm btn-outline-danger" (click)="deleteReturn(row._id)">Delete</button></td>
                  </tr>
                  <tr *ngIf="!returns.length"><td colspan="4">No returns.</td></tr>
                </tbody>
              </table>
              <app-pagination [meta]="returnsPage" (pageChange)="loadReturns($event)" />
            </div>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="showAuditLogs && activeSection==='audit-logs'">
        <div class="section-title"><h2>Audit Logs</h2><span class="muted">System activity</span></div>
        <div class="card table-wrap">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead><tr><th>Entity</th><th>Action</th><th>Message</th><th>Time</th></tr></thead>
            <tbody><tr *ngFor="let row of auditLogs"><td>{{ row.entity }}</td><td>{{ row.action }}</td><td>{{ row.message || '-' }}</td><td>{{ row.createdAt | date:'medium' }}</td></tr><tr *ngIf="!auditLogs.length"><td colspan="4">No logs.</td></tr></tbody>
          </table>
          <app-pagination [meta]="auditPage" (pageChange)="loadAuditLogs($event)" />
        </div>
      </section>

      <section class="section" *ngIf="isAdmin && activeSection==='user-onboarding'">
        <div class="section-title"><h2>User Onboarding</h2><span class="muted">Approve or reject users</span></div>
        <div class="card table-wrap">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Company</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let row of pendingUsers">
                <td>{{ row.name }}</td><td>{{ row.role }}</td><td>{{ row.email }}</td><td>{{ row.companyName || '-' }}</td>
                <td class="actions-cell"><button class="btn btn-sm btn-outline-success" (click)="approveUser(row._id)">Approve</button><button class="btn btn-sm btn-outline-danger" (click)="rejectUser(row._id)">Reject</button></td>
              </tr>
              <tr *ngIf="!pendingUsers.length"><td colspan="5">No pending users.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section" *ngIf="isAdmin && activeSection==='company-settings'">
        <div class="section-title"><h2>Company Settings</h2><span class="muted">Manage brand details</span></div>
        <div class="card grid">
          <input class="form-control" [(ngModel)]="companyForm.name" placeholder="Company name" />
          <input class="form-control" [(ngModel)]="companyForm.logoUrl" placeholder="Logo URL" />
          <input class="form-control" [(ngModel)]="companyForm.websiteUrl" placeholder="Website URL" />
          <input class="form-control" [(ngModel)]="companyForm.tagline" placeholder="Tagline" />
          <textarea class="form-control" rows="3" [(ngModel)]="companyForm.description" placeholder="Description"></textarea>
          <button class="btn btn-primary" (click)="saveCompanySettings()">Save Company Details</button>
        </div>
      </section>

      <section class="section" *ngIf="!isAdmin && activeSection==='profile'">
        <div class="section-title"><h2>Profile</h2><span class="muted">Manage account details</span></div>
        <div class="card grid">
          <input class="form-control" [(ngModel)]="profileForm.name" placeholder="Full Name" />
          <input class="form-control" [(ngModel)]="profileForm.email" placeholder="Email" disabled />
          <input class="form-control" [(ngModel)]="profileForm.phone" placeholder="Phone" />
          <input class="form-control" [(ngModel)]="profileForm.address" placeholder="Address" />
          <input class="form-control" [(ngModel)]="profileForm.companyName" placeholder="Company Name" />
          <input class="form-control" [(ngModel)]="profileForm.gstNumber" placeholder="GST Number" />
          <button class="btn btn-primary" (click)="saveProfile()">Save Profile</button>
        </div>
      </section>

    </div></div>
  </div>
  `
})
export class AppShellComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly auth = inject(AuthService);
  private authApi = inject(AuthApiService);
  private inventoryApi = inject(InventoryApiService);
  private entitiesApi = inject(EntitiesApiService);
  private adminApi = inject(AdminApiService);
  private auditApi = inject(AuditApiService);

  role = '';
  activeSection = 'dashboard';
  basePath = '/admin';
  headerTitle = 'Dashboard';
  headerSubtitle = 'Workspace';
  error = '';
  sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === '1';
  sidebarOpen = false;

  dashboard: any = null;
  items: any[] = [];
  transactions: any[] = [];
  stocks: any[] = [];
  suppliers: any[] = [];
  customers: any[] = [];
  locations: any[] = [];
  purchaseOrders: any[] = [];
  salesOrders: any[] = [];
  returns: any[] = [];
  auditLogs: any[] = [];
  pendingUsers: any[] = [];
  companySettings: any = null;

  itemsPage = blankPage();
  transactionsPage = blankPage();
  stocksPage = blankPage();
  suppliersPage = blankPage();
  customersPage = blankPage();
  locationsPage = blankPage();
  purchaseOrdersPage = blankPage();
  salesOrdersPage = blankPage();
  returnsPage = blankPage();
  auditPage = blankPage();

  query = '';
  category = '';
  lowStockOnly = false;
  editingItemId = '';
  itemForm = { name: '', sku: '', quantity: 0, cost: 0, price: 0 };
  adjustForm = { itemId: '', type: 'receive', quantity: 0, reason: '' };
  supplierForm = { name: '', contactName: '', phone: '', email: '', address: '' };
  customerForm = { name: '', contactName: '', phone: '', email: '', address: '' };
  locationForm = { name: '', code: '', address: '', isDefault: false };
  purchaseForm = { supplier: '', status: 'requested', itemId: '', quantity: 1, cost: 0, expectedDate: '', notes: '' };
  salesForm = { customer: '', status: 'requested', itemId: '', quantity: 1, price: 0, deliveryDate: '', notes: '' };
  returnForm = { type: 'customer', status: 'requested', itemId: '', quantity: 1, reason: '', notes: '' };
  editingSupplierId = '';
  editingCustomerId = '';
  editingLocationId = '';
  companyForm = { name: '', logoUrl: '', websiteUrl: '', tagline: '', description: '' };
  profileForm = { name: '', email: '', phone: '', address: '', companyName: '', gstNumber: '' };

  get isAdmin() { return this.role === 'admin' || this.role === 'super_admin'; }
  get isSeller() { return this.role === 'seller'; }
  get isBuyer() { return this.role === 'buyer'; }
  get showInventory() { return this.isAdmin; }
  get showAdjustments() { return this.isAdmin; }
  get showStockLocations() { return this.isAdmin; }
  get showSuppliers() { return this.isAdmin; }
  get showCustomers() { return this.isAdmin; }
  get showLocations() { return this.isAdmin; }
  get showPurchaseOrders() { return this.isAdmin || this.isSeller; }
  get showSalesOrders() { return this.isAdmin || this.isBuyer; }
  get showReturns() { return this.isAdmin; }
  get showAuditLogs() { return this.isAdmin; }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const user = this.auth.user();
      if (!user) {
        this.router.navigateByUrl('/login');
        return;
      }
      this.role = params['role'];
      const expected = user.role === 'admin' || user.role === 'super_admin' ? 'admin' : user.role === 'seller' ? 'seller' : 'buyer';
      if (this.role !== expected) {
        this.router.navigateByUrl(`/${expected}/dashboard`);
        return;
      }
      this.basePath = `/${this.role}`;
      this.activeSection = params['section'] || 'dashboard';
      this.headerTitle = this.activeSection.replace(/-/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase());
      this.headerSubtitle = this.isAdmin ? 'Admin workspace' : this.isSeller ? 'Seller workspace' : 'Buyer workspace';
      this.profileForm = { name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '', companyName: user.companyName || '', gstNumber: user.gstNumber || '' };
      this.loadSection();
    });
  }

  toggleCollapse() { this.sidebarCollapsed = !this.sidebarCollapsed; localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed ? '1' : '0'); }
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }

  private loadSection() {
    if (this.activeSection === 'dashboard') { if (this.isAdmin) this.adminApi.getDashboard().subscribe({ next: (d) => (this.dashboard = d), error: (e) => this.onErr(e, 'Dashboard load failed') }); this.loadPurchaseOrders(); this.loadSalesOrders(); return; }
    if (this.activeSection === 'inventory') this.loadItems();
    if (this.activeSection === 'adjustments') { this.loadItems(); this.loadTransactions(); }
    if (this.activeSection === 'stock-locations') this.loadStocks();
    if (this.activeSection === 'suppliers') this.loadSuppliers();
    if (this.activeSection === 'customers') this.loadCustomers();
    if (this.activeSection === 'locations') this.loadLocations();
    if (this.activeSection === 'purchase-orders') { this.loadPurchaseOrders(); this.loadItems(); if (this.isAdmin) this.loadSuppliers(); }
    if (this.activeSection === 'sales-orders') { this.loadSalesOrders(); this.loadItems(); if (this.isAdmin) this.loadCustomers(); }
    if (this.activeSection === 'returns') { this.loadReturns(); this.loadItems(); }
    if (this.activeSection === 'audit-logs') this.loadAuditLogs();
    if (this.activeSection === 'user-onboarding') this.adminApi.getPendingUsers().subscribe({ next: (r) => (this.pendingUsers = r), error: (e) => this.onErr(e, 'Users load failed') });
    if (this.activeSection === 'company-settings') this.adminApi.getCompanySettings().subscribe({ next: (r) => { this.companySettings = r; this.companyForm = { name: r.name || '', logoUrl: r.logoUrl || '', websiteUrl: r.websiteUrl || '', tagline: r.tagline || '', description: r.description || '' }; }, error: (e) => this.onErr(e, 'Company settings load failed') });
  }

  loadItems(page = this.itemsPage.page) { this.inventoryApi.getItems({ page, limit: PAGE_SIZE, search: this.query || undefined, category: this.category || undefined, lowStock: this.lowStockOnly || undefined }).subscribe({ next: (r) => { this.items = r.data; this.itemsPage = r.pagination; }, error: (e) => this.onErr(e, 'Items load failed') }); }
  loadTransactions(page = this.transactionsPage.page) { this.inventoryApi.getTransactions({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.transactions = r.data; this.transactionsPage = r.pagination; }, error: (e) => this.onErr(e, 'Transactions load failed') }); }
  loadStocks(page = this.stocksPage.page) { this.inventoryApi.getStocks({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.stocks = r.data; this.stocksPage = r.pagination; }, error: (e) => this.onErr(e, 'Stocks load failed') }); }
  loadSuppliers(page = this.suppliersPage.page) { this.entitiesApi.getSuppliers({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.suppliers = r.data; this.suppliersPage = r.pagination; }, error: (e) => this.onErr(e, 'Suppliers load failed') }); }
  loadCustomers(page = this.customersPage.page) { this.entitiesApi.getCustomers({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.customers = r.data; this.customersPage = r.pagination; }, error: (e) => this.onErr(e, 'Customers load failed') }); }
  loadLocations(page = this.locationsPage.page) { this.entitiesApi.getLocations({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.locations = r.data; this.locationsPage = r.pagination; }, error: (e) => this.onErr(e, 'Locations load failed') }); }
  loadPurchaseOrders(page = this.purchaseOrdersPage.page) { this.entitiesApi.getPurchaseOrders({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.purchaseOrders = r.data; this.purchaseOrdersPage = r.pagination; }, error: (e) => this.onErr(e, 'Purchase orders load failed') }); }
  loadSalesOrders(page = this.salesOrdersPage.page) { this.entitiesApi.getSalesOrders({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.salesOrders = r.data; this.salesOrdersPage = r.pagination; }, error: (e) => this.onErr(e, 'Sales orders load failed') }); }
  loadReturns(page = this.returnsPage.page) { this.entitiesApi.getReturns({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.returns = r.data; this.returnsPage = r.pagination; }, error: (e) => this.onErr(e, 'Returns load failed') }); }
  loadAuditLogs(page = this.auditPage.page) { this.auditApi.getLogs({ page, limit: PAGE_SIZE }).subscribe({ next: (r) => { this.auditLogs = r.data; this.auditPage = r.pagination; }, error: (e) => this.onErr(e, 'Audit logs load failed') }); }

  saveItem() {
    if (!this.itemForm.name.trim() || !this.itemForm.sku.trim()) return;
    const req = this.editingItemId ? this.inventoryApi.updateItem(this.editingItemId, this.itemForm as any) : this.inventoryApi.createItem(this.itemForm as any);
    req.subscribe({ next: () => { notify('success', this.editingItemId ? 'Item updated' : 'Item created'); this.editingItemId = ''; this.itemForm = { name: '', sku: '', quantity: 0, cost: 0, price: 0 }; this.loadItems(); }, error: (e) => this.onErr(e, 'Save item failed') });
  }
  startEditItem(item: any) { this.editingItemId = item._id; this.itemForm = { name: item.name, sku: item.sku, quantity: item.quantity, cost: item.cost, price: item.price }; }
  deleteItem(id: string) { if (!confirm('Delete item?')) return; this.inventoryApi.deleteItem(id).subscribe({ next: () => this.loadItems(), error: (e) => this.onErr(e, 'Delete item failed') }); }
  applyAdjustment() { if (!this.adjustForm.itemId || !this.adjustForm.quantity) return; this.inventoryApi.adjustStock(this.adjustForm as any).subscribe({ next: () => { notify('success', 'Adjustment applied'); this.adjustForm = { itemId: '', type: 'receive', quantity: 0, reason: '' }; this.loadTransactions(); }, error: (e) => this.onErr(e, 'Adjustment failed') }); }

  saveSupplier() {
    if (!this.supplierForm.name.trim()) return;
    const req = this.editingSupplierId
      ? this.entitiesApi.updateSupplier(this.editingSupplierId, this.supplierForm)
      : this.entitiesApi.createSupplier(this.supplierForm);
    req.subscribe({
      next: () => {
        notify('success', this.editingSupplierId ? 'Supplier updated' : 'Supplier created');
        this.cancelSupplierEdit();
        this.loadSuppliers(1);
      },
      error: (e) => this.onErr(e, 'Supplier save failed')
    });
  }
  startEditSupplier(row: any) {
    this.editingSupplierId = row._id;
    this.supplierForm = { name: row.name || '', contactName: row.contactName || '', phone: row.phone || '', email: row.email || '', address: row.address || '' };
  }
  cancelSupplierEdit() { this.editingSupplierId = ''; this.supplierForm = { name: '', contactName: '', phone: '', email: '', address: '' }; }
  deleteSupplier(id: string) { if (!confirm('Delete supplier?')) return; this.entitiesApi.deleteSupplier(id).subscribe({ next: () => this.loadSuppliers(), error: (e) => this.onErr(e, 'Delete supplier failed') }); }

  saveCustomer() {
    if (!this.customerForm.name.trim()) return;
    const req = this.editingCustomerId
      ? this.entitiesApi.updateCustomer(this.editingCustomerId, this.customerForm)
      : this.entitiesApi.createCustomer(this.customerForm);
    req.subscribe({
      next: () => {
        notify('success', this.editingCustomerId ? 'Customer updated' : 'Customer created');
        this.cancelCustomerEdit();
        this.loadCustomers(1);
      },
      error: (e) => this.onErr(e, 'Customer save failed')
    });
  }
  startEditCustomer(row: any) {
    this.editingCustomerId = row._id;
    this.customerForm = { name: row.name || '', contactName: row.contactName || '', phone: row.phone || '', email: row.email || '', address: row.address || '' };
  }
  cancelCustomerEdit() { this.editingCustomerId = ''; this.customerForm = { name: '', contactName: '', phone: '', email: '', address: '' }; }
  deleteCustomer(id: string) { if (!confirm('Delete customer?')) return; this.entitiesApi.deleteCustomer(id).subscribe({ next: () => this.loadCustomers(), error: (e) => this.onErr(e, 'Delete customer failed') }); }

  saveLocation() {
    if (!this.locationForm.name.trim()) return;
    const req = this.editingLocationId
      ? this.entitiesApi.updateLocation(this.editingLocationId, this.locationForm)
      : this.entitiesApi.createLocation(this.locationForm);
    req.subscribe({
      next: () => {
        notify('success', this.editingLocationId ? 'Location updated' : 'Location created');
        this.cancelLocationEdit();
        this.loadLocations(1);
      },
      error: (e) => this.onErr(e, 'Location save failed')
    });
  }
  startEditLocation(row: any) {
    this.editingLocationId = row._id;
    this.locationForm = { name: row.name || '', code: row.code || '', address: row.address || '', isDefault: !!row.isDefault };
  }
  cancelLocationEdit() { this.editingLocationId = ''; this.locationForm = { name: '', code: '', address: '', isDefault: false }; }
  deleteLocation(id: string) { if (!confirm('Delete location?')) return; this.entitiesApi.deleteLocation(id).subscribe({ next: () => this.loadLocations(), error: (e) => this.onErr(e, 'Delete location failed') }); }

  createPurchaseOrder() {
    if (!this.purchaseForm.supplier || !this.purchaseForm.itemId || !this.purchaseForm.quantity) return;
    const payload = {
      supplier: this.purchaseForm.supplier,
      status: this.purchaseForm.status,
      expectedDate: this.purchaseForm.expectedDate || undefined,
      notes: this.purchaseForm.notes || undefined,
      items: [{ item: this.purchaseForm.itemId, quantity: Number(this.purchaseForm.quantity), cost: Number(this.purchaseForm.cost || 0) }]
    };
    this.entitiesApi.createPurchaseOrder(payload).subscribe({
      next: () => {
        notify('success', 'Purchase order created');
        this.purchaseForm = { supplier: '', status: 'requested', itemId: '', quantity: 1, cost: 0, expectedDate: '', notes: '' };
        this.loadPurchaseOrders(1);
      },
      error: (e) => this.onErr(e, 'Create purchase order failed')
    });
  }
  updatePurchaseStatus(id: string, status: string) { this.entitiesApi.updatePurchaseOrder(id, { status }).subscribe({ next: () => this.loadPurchaseOrders(), error: (e) => this.onErr(e, 'Update purchase status failed') }); }
  deletePurchaseOrder(id: string) { if (!confirm('Delete purchase order?')) return; this.entitiesApi.deletePurchaseOrder(id).subscribe({ next: () => this.loadPurchaseOrders(), error: (e) => this.onErr(e, 'Delete purchase order failed') }); }

  createSalesOrder() {
    const user = this.auth.user();
    const customer = this.isBuyer ? user?.customerId || '' : this.salesForm.customer;
    if (!customer || !this.salesForm.itemId || !this.salesForm.quantity) return;
    const payload = {
      customer,
      status: this.isBuyer ? 'requested' : this.salesForm.status,
      deliveryDate: this.salesForm.deliveryDate || undefined,
      notes: this.salesForm.notes || undefined,
      items: [{ item: this.salesForm.itemId, quantity: Number(this.salesForm.quantity), price: Number(this.salesForm.price || 0) }]
    };
    this.entitiesApi.createSalesOrder(payload).subscribe({
      next: () => {
        notify('success', 'Sales order created');
        this.salesForm = { customer: '', status: 'requested', itemId: '', quantity: 1, price: 0, deliveryDate: '', notes: '' };
        this.loadSalesOrders(1);
      },
      error: (e) => this.onErr(e, 'Create sales order failed')
    });
  }
  updateSalesStatus(id: string, status: string) { this.entitiesApi.updateSalesOrder(id, { status }).subscribe({ next: () => this.loadSalesOrders(), error: (e) => this.onErr(e, 'Update sales status failed') }); }
  deleteSalesOrder(id: string) { if (!confirm('Delete sales order?')) return; this.entitiesApi.deleteSalesOrder(id).subscribe({ next: () => this.loadSalesOrders(), error: (e) => this.onErr(e, 'Delete sales order failed') }); }

  createReturn() {
    if (!this.returnForm.itemId || !this.returnForm.quantity) return;
    const payload = {
      type: this.returnForm.type,
      status: this.returnForm.status,
      notes: this.returnForm.notes || undefined,
      items: [{ item: this.returnForm.itemId, quantity: Number(this.returnForm.quantity), reason: this.returnForm.reason || undefined }]
    };
    this.entitiesApi.createReturn(payload).subscribe({
      next: () => {
        notify('success', 'Return created');
        this.returnForm = { type: 'customer', status: 'requested', itemId: '', quantity: 1, reason: '', notes: '' };
        this.loadReturns(1);
      },
      error: (e) => this.onErr(e, 'Create return failed')
    });
  }
  updateReturnStatus(id: string, status: string) { this.entitiesApi.updateReturn(id, { status }).subscribe({ next: () => this.loadReturns(), error: (e) => this.onErr(e, 'Update return status failed') }); }
  deleteReturn(id: string) { if (!confirm('Delete return?')) return; this.entitiesApi.deleteReturn(id).subscribe({ next: () => this.loadReturns(), error: (e) => this.onErr(e, 'Delete return failed') }); }

  approveUser(id: string) { this.adminApi.approveUser(id).subscribe({ next: () => { notify('success', 'User approved'); this.adminApi.getPendingUsers().subscribe({ next: (r) => (this.pendingUsers = r), error: (e) => this.onErr(e, 'Users load failed') }); }, error: (e) => this.onErr(e, 'Approve user failed') }); }
  rejectUser(id: string) { this.adminApi.rejectUser(id).subscribe({ next: () => { notify('success', 'User rejected'); this.adminApi.getPendingUsers().subscribe({ next: (r) => (this.pendingUsers = r), error: (e) => this.onErr(e, 'Users load failed') }); }, error: (e) => this.onErr(e, 'Reject user failed') }); }

  viewPurchasePdf(id: string) { this.entitiesApi.getPurchaseOrderPdf(id).subscribe({ next: (blob) => window.open(URL.createObjectURL(blob), '_blank'), error: (e) => this.onErr(e, 'Open PDF failed') }); }
  downloadPurchasePdf(id: string) { this.entitiesApi.getPurchaseOrderPdf(id).subscribe({ next: (blob) => this.saveBlob(blob, `purchase-order-${id}.pdf`), error: (e) => this.onErr(e, 'Download PDF failed') }); }
  viewSalesPdf(id: string) { this.entitiesApi.getSalesOrderPdf(id).subscribe({ next: (blob) => window.open(URL.createObjectURL(blob), '_blank'), error: (e) => this.onErr(e, 'Open PDF failed') }); }
  downloadSalesPdf(id: string) { this.entitiesApi.getSalesOrderPdf(id).subscribe({ next: (blob) => this.saveBlob(blob, `sales-order-${id}.pdf`), error: (e) => this.onErr(e, 'Download PDF failed') }); }
  saveCompanySettings() { if (!this.companyForm.name.trim()) return; this.adminApi.updateCompanySettings(this.companyForm).subscribe({ next: (res) => { this.companySettings = res; notify('success', 'Company settings saved'); }, error: (e) => this.onErr(e, 'Save company settings failed') }); }
  saveProfile() { this.authApi.updateProfile(this.profileForm as any).subscribe({ next: (user) => { this.auth.updateUser(user as any); notify('success', 'Profile updated'); }, error: (e) => this.onErr(e, 'Profile update failed') }); }

  private onErr(err: unknown, fallback: string) { this.error = (err as { error?: string; message?: string })?.error || (err as { message?: string })?.message || fallback; notify('error', fallback, this.error); }
  private saveBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
}
