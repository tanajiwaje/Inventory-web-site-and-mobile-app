import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiBaseUrl, toQuery } from '../api.utils';
import { Customer, Location, Paginated, PurchaseOrder, ReturnEntry, SalesOrder, Supplier } from '../types';

@Injectable({ providedIn: 'root' })
export class EntitiesApiService {
  private base = getApiBaseUrl();
  constructor(private http: HttpClient) {}

  getSuppliers(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<Supplier>>(
      `${this.base}/api/suppliers${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }
  createSupplier(payload: Partial<Supplier>) {
    return this.http.post<Supplier>(`${this.base}/api/suppliers`, payload);
  }
  updateSupplier(id: string, payload: Partial<Supplier>) {
    return this.http.put<Supplier>(`${this.base}/api/suppliers/${id}`, payload);
  }
  deleteSupplier(id: string) {
    return this.http.delete<void>(`${this.base}/api/suppliers/${id}`);
  }

  getCustomers(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<Customer>>(
      `${this.base}/api/customers${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }
  createCustomer(payload: Partial<Customer>) {
    return this.http.post<Customer>(`${this.base}/api/customers`, payload);
  }
  updateCustomer(id: string, payload: Partial<Customer>) {
    return this.http.put<Customer>(`${this.base}/api/customers/${id}`, payload);
  }
  deleteCustomer(id: string) {
    return this.http.delete<void>(`${this.base}/api/customers/${id}`);
  }

  getLocations(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<Location>>(
      `${this.base}/api/locations${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }
  createLocation(payload: Partial<Location>) {
    return this.http.post<Location>(`${this.base}/api/locations`, payload);
  }
  updateLocation(id: string, payload: Partial<Location>) {
    return this.http.put<Location>(`${this.base}/api/locations/${id}`, payload);
  }
  deleteLocation(id: string) {
    return this.http.delete<void>(`${this.base}/api/locations/${id}`);
  }

  getPurchaseOrders(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<PurchaseOrder>>(
      `${this.base}/api/purchase-orders${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }
  createPurchaseOrder(payload: Record<string, unknown>) {
    return this.http.post<PurchaseOrder>(`${this.base}/api/purchase-orders`, payload);
  }
  updatePurchaseOrder(id: string, payload: Record<string, unknown>) {
    return this.http.put<PurchaseOrder>(`${this.base}/api/purchase-orders/${id}`, payload);
  }
  deletePurchaseOrder(id: string) {
    return this.http.delete<void>(`${this.base}/api/purchase-orders/${id}`);
  }
  getPurchaseOrderPdf(id: string) {
    return this.http.get(`${this.base}/api/purchase-orders/${id}/pdf`, { responseType: 'blob' });
  }

  getSalesOrders(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<SalesOrder>>(
      `${this.base}/api/sales-orders${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }
  createSalesOrder(payload: Record<string, unknown>) {
    return this.http.post<SalesOrder>(`${this.base}/api/sales-orders`, payload);
  }
  updateSalesOrder(id: string, payload: Record<string, unknown>) {
    return this.http.put<SalesOrder>(`${this.base}/api/sales-orders/${id}`, payload);
  }
  deleteSalesOrder(id: string) {
    return this.http.delete<void>(`${this.base}/api/sales-orders/${id}`);
  }
  getSalesOrderPdf(id: string) {
    return this.http.get(`${this.base}/api/sales-orders/${id}/pdf`, { responseType: 'blob' });
  }

  getReturns(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<ReturnEntry>>(
      `${this.base}/api/returns${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }
  createReturn(payload: Record<string, unknown>) {
    return this.http.post<ReturnEntry>(`${this.base}/api/returns`, payload);
  }
  updateReturn(id: string, payload: Record<string, unknown>) {
    return this.http.put<ReturnEntry>(`${this.base}/api/returns/${id}`, payload);
  }
  deleteReturn(id: string) {
    return this.http.delete<void>(`${this.base}/api/returns/${id}`);
  }
}
