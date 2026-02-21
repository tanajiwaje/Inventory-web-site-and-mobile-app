export type Role = 'admin' | 'super_admin' | 'seller' | 'buyer' | string;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
  supplierId?: string;
  customerId?: string;
};

export type InventoryItem = {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  cost: number;
  price: number;
  barcode?: string;
  category?: string;
  lowStockThreshold: number;
  description?: string;
};

export type InventoryPayload = {
  name: string;
  sku: string;
  quantity: number;
  cost: number;
  price: number;
  barcode?: string;
  category?: string;
  lowStockThreshold?: number;
  description?: string;
};

export type InventoryAdjustmentPayload = {
  itemId: string;
  locationId?: string;
  type: 'receive' | 'issue' | 'adjust';
  quantity: number;
  reason?: string;
};

export type InventoryTransaction = {
  _id: string;
  item: { _id: string; name: string; sku: string };
  type: 'receive' | 'issue' | 'adjust';
  quantityChange: number;
  reason?: string;
  createdAt: string;
};

export type InventoryStock = {
  _id: string;
  item: { _id: string; name: string; sku: string };
  location: { _id: string; name: string; code?: string };
  quantity: number;
};

export type Supplier = {
  _id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type Customer = {
  _id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type Location = {
  _id: string;
  name: string;
  code?: string;
  address?: string;
  isDefault: boolean;
};

export type PurchaseOrder = {
  _id: string;
  supplier: Supplier;
  status: 'requested' | 'supplier_submitted' | 'approved' | 'received';
  items: Array<{ item: InventoryItem; quantity: number; cost: number }>;
  expectedDate?: string;
  deliveryDate?: string;
  paymentTerms?: string;
  taxRate?: number;
  shippingAddress?: string;
  receivedDate?: string;
  notes?: string;
};

export type SalesOrder = {
  _id: string;
  customer: Customer;
  status: 'requested' | 'approved' | 'received';
  items: Array<{ item: InventoryItem; quantity: number; price: number }>;
  deliveryDate?: string;
  approvedDate?: string;
  receivedDate?: string;
  paymentTerms?: string;
  taxRate?: number;
  shippingAddress?: string;
  notes?: string;
};

export type ReturnEntry = {
  _id: string;
  type: 'customer' | 'supplier';
  status: 'requested' | 'received' | 'closed';
  items: Array<{ item: InventoryItem; quantity: number; reason?: string }>;
  notes?: string;
};

export type AuditLog = {
  _id: string;
  entity: string;
  entityId: string;
  action: string;
  message?: string;
  createdAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type CompanySettings = {
  _id?: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  tagline?: string;
  description?: string;
};

export type AdminDashboard = {
  users: { total: number; pending: number; approved: number; rejected: number };
  suppliers: { count: number };
  customers: { count: number };
  inventory: {
    summary: { totalItems: number; totalQuantity: number; lowStockCount: number };
    valuation: { totalValue: number; totalCost: number };
  };
  locations: Array<{ locationId: string; locationName: string; totalQuantity: number }>;
  purchaseOrders: {
    count: number;
    totalQty: number;
    subtotal: number;
    gst: number;
    total: number;
    statusCounts: Record<string, number>;
  };
  salesOrders: {
    count: number;
    totalQty: number;
    subtotal: number;
    gst: number;
    total: number;
    statusCounts: Record<string, number>;
  };
  profit: { net: number; margin: number };
};
