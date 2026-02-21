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
  createdAt?: string;
  updatedAt?: string;
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
  item: {
    _id: string;
    name: string;
    sku: string;
  };
  type: 'receive' | 'issue' | 'adjust';
  quantityChange: number;
  reason?: string;
  createdAt: string;
};

export type ReportSummary = {
  totalItems: number;
  totalQuantity: number;
  lowStockCount: number;
};

export type ReportValuation = {
  totalValue: number;
  totalCost: number;
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

export type PurchaseOrderLine = {
  item: InventoryItem;
  quantity: number;
  cost: number;
};

export type PurchaseOrder = {
  _id: string;
  supplier: Supplier;
  status: 'requested' | 'supplier_submitted' | 'approved' | 'received';
  items: PurchaseOrderLine[];
  expectedDate?: string;
  deliveryDate?: string;
  paymentTerms?: string;
  taxRate?: number;
  shippingAddress?: string;
  receivedDate?: string;
  notes?: string;
};

export type SalesOrderLine = {
  item: InventoryItem;
  quantity: number;
  price: number;
};

export type SalesOrder = {
  _id: string;
  customer: Customer;
  status: 'requested' | 'approved' | 'received';
  items: SalesOrderLine[];
  deliveryDate?: string;
  approvedDate?: string;
  receivedDate?: string;
  paymentTerms?: string;
  taxRate?: number;
  shippingAddress?: string;
  notes?: string;
};

export type ReturnLine = {
  item: InventoryItem;
  quantity: number;
  reason?: string;
};

export type ReturnEntry = {
  _id: string;
  type: 'customer' | 'supplier';
  status: 'requested' | 'received' | 'closed';
  items: ReturnLine[];
  notes?: string;
};

export type SupplierPayload = Omit<Supplier, '_id'>;
export type CustomerPayload = Omit<Customer, '_id'>;
export type LocationPayload = Omit<Location, '_id'>;

export type PurchaseOrderPayload = {
  supplier: string;
  status: 'requested' | 'supplier_submitted' | 'approved' | 'received';
  items: Array<{ item: string; quantity: number; cost: number }>;
  expectedDate?: string;
  deliveryDate?: string;
  paymentTerms?: string;
  taxRate?: number;
  shippingAddress?: string;
  receivedDate?: string;
  notes?: string;
};

export type SalesOrderPayload = {
  customer: string;
  status: 'requested' | 'approved' | 'received';
  items: Array<{ item: string; quantity: number; price: number }>;
  deliveryDate?: string;
  approvedDate?: string;
  receivedDate?: string;
  paymentTerms?: string;
  taxRate?: number;
  shippingAddress?: string;
  notes?: string;
};

export type ReturnPayload = {
  type: 'customer' | 'supplier';
  status: 'requested' | 'received' | 'closed';
  items: Array<{ item: string; quantity: number; reason?: string }>;
  notes?: string;
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

export type InventoryStock = {
  _id: string;
  item: { _id: string; name: string; sku: string };
  location: { _id: string; name: string; code?: string };
  quantity: number;
};

export type AuditLog = {
  _id: string;
  entity: string;
  entityId: string;
  action: string;
  message?: string;
  userId?: string;
  createdAt: string;
};

export type StatusCounts = Record<string, number>;

export type AdminDashboard = {
  users: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  suppliers: {
    count: number;
  };
  customers: {
    count: number;
  };
  inventory: {
    summary: ReportSummary;
    valuation: ReportValuation;
  };
  locations: Array<{
    locationId: string;
    locationName: string;
    totalQuantity: number;
  }>;
  purchaseOrders: {
    count: number;
    totalQty: number;
    subtotal: number;
    gst: number;
    total: number;
    statusCounts: StatusCounts;
  };
  salesOrders: {
    count: number;
    totalQty: number;
    subtotal: number;
    gst: number;
    total: number;
    statusCounts: StatusCounts;
  };
  profit: {
    net: number;
    margin: number;
  };
  monthly: Array<{
    month: string;
    purchaseTotal: number;
    salesTotal: number;
    purchaseSubtotal: number;
    salesSubtotal: number;
  }>;
  categorySummary: Array<{
    category: string;
    quantity: number;
    value: number;
  }>;
  topItems: Array<{
    itemId: string;
    name: string;
    sku: string;
    quantity: number;
    value: number;
  }>;
  salesByCustomer: Array<{
    customerId: string;
    customerName: string;
    subtotal: number;
  }>;
  salesByItem: Array<{
    itemId: string;
    name: string;
    sku: string;
    quantity: number;
    subtotal: number;
  }>;
};

export type CompanySettings = {
  _id?: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  tagline?: string;
  description?: string;
};
