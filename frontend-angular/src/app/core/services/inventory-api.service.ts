import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiBaseUrl, toQuery } from '../api.utils';
import {
  InventoryAdjustmentPayload,
  InventoryItem,
  InventoryPayload,
  InventoryStock,
  InventoryTransaction,
  Paginated
} from '../types';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private base = getApiBaseUrl();
  constructor(private http: HttpClient) {}

  getItems(params?: { search?: string; category?: string; lowStock?: boolean; page?: number; limit?: number }) {
    return this.http.get<Paginated<InventoryItem>>(
      `${this.base}/api/inventory${toQuery({
        search: params?.search,
        category: params?.category,
        lowStock: params?.lowStock,
        page: params?.page,
        limit: params?.limit
      })}`
    );
  }

  createItem(payload: InventoryPayload) {
    return this.http.post<InventoryItem>(`${this.base}/api/inventory`, payload);
  }

  updateItem(id: string, payload: InventoryPayload) {
    return this.http.put<InventoryItem>(`${this.base}/api/inventory/${id}`, payload);
  }

  deleteItem(id: string) {
    return this.http.delete<void>(`${this.base}/api/inventory/${id}`);
  }

  adjustStock(payload: InventoryAdjustmentPayload) {
    return this.http.post<{ item: InventoryItem; transaction: InventoryTransaction }>(
      `${this.base}/api/inventory/adjust`,
      payload
    );
  }

  getTransactions(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<InventoryTransaction>>(
      `${this.base}/api/inventory/transactions${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }

  getStocks(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<InventoryStock>>(
      `${this.base}/api/inventory/stocks${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }

  getExportCsv() {
    return this.http.get(`${this.base}/api/inventory/export`, { responseType: 'text' });
  }

  importCsv(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.base}/api/inventory/import`, form);
  }
}
