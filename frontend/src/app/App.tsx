import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  adjustStock,
  createItem,
  deleteItem,
  exportItemsCsv,
  getItems,
  getStocks,
  getTransactions,
  importItemsCsv,
  updateItem
} from '../features/inventory/api';
import {
  createCustomer,
  createLocation,
  createPurchaseOrder,
  createReturn,
  createSalesOrder,
  createSupplier,
  deleteCustomer,
  deleteLocation,
  deletePurchaseOrder,
  deleteReturn,
  deleteSalesOrder,
  deleteSupplier,
  getPurchaseOrderPdf,
  getCustomers,
  getLocations,
  getPurchaseOrders,
  getReturns,
  getSalesOrderPdf,
  getSalesOrders,
  getSuppliers,
  updateCustomer,
  updateLocation,
  updatePurchaseOrder,
  updateReturn,
  updateSalesOrder,
  updateSupplier
} from '../features/entities/api';
import { CustomersSection } from '../features/entities/components/CustomersSection';
import { LocationsSection } from '../features/entities/components/LocationsSection';
import { PurchaseOrdersSection } from '../features/entities/components/PurchaseOrdersSection';
import { ReturnsSection } from '../features/entities/components/ReturnsSection';
import { SalesOrdersSection } from '../features/entities/components/SalesOrdersSection';
import { SuppliersSection } from '../features/entities/components/SuppliersSection';
import { InventoryForm } from '../features/inventory/components/InventoryForm';
import { LocationStockTable } from '../features/inventory/components/LocationStockTable';
import { InventoryTable } from '../features/inventory/components/InventoryTable';
import { RecentTransactions } from '../features/inventory/components/RecentTransactions';
import { StockAdjustment } from '../features/inventory/components/StockAdjustment';
import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth';
import { getAuditLogs } from '../features/audit/api';
import { AuditLogTable } from '../features/audit/components/AuditLogTable';
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAdminDashboard,
  getCompanySettings,
  updateCompanySettings
} from '../features/admin/api';
import { updateProfile } from '../features/auth/api';
import { UserOnboardingTable } from '../features/admin/components/UserOnboardingTable';
import { showError, showSuccess } from '../shared/notify';
import {
  AdminDashboard,
  CompanySettings,
  Customer,
  CustomerPayload,
  AuditLog,
  InventoryAdjustmentPayload,
  InventoryItem,
  InventoryPayload,
  InventoryStock,
  InventoryTransaction,
  Location,
  LocationPayload,
  PaginationMeta,
  PurchaseOrder,
  PurchaseOrderPayload,
  ReportSummary,
  ReportValuation,
  ReturnEntry,
  ReturnPayload,
  SalesOrder,
  SalesOrderPayload,
  Supplier,
  SupplierPayload
} from '../shared/types';

const sectionLabelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  adjustments: 'Adjustments',
  'stock-locations': 'Location Stock',
  suppliers: 'Suppliers',
  customers: 'Customers',
  locations: 'Locations',
  'purchase-orders': 'Purchase Orders',
  'sales-orders': 'Sales Orders',
  returns: 'Returns',
  'audit-logs': 'Audit Logs',
  'user-onboarding': 'User Onboarding',
  'company-settings': 'Company Settings',
  profile: 'Profile'
};

const useCountUp = (value: number, duration = 500) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = performance.now();
    const from = display;
    const delta = value - from;
    if (delta === 0) return;

    let frameId = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const next = from + delta * progress;
      setDisplay(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return display;
};

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export const App = () => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === '1'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = user?.role;
  const roleClass =
    role === 'admin' || role === 'super_admin'
      ? 'role-admin'
      : role === 'seller'
        ? 'role-seller'
        : 'role-buyer';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSeller = role === 'seller';
  const isBuyer = role === 'buyer';
  const showInventory = isAdmin;
  const showAdjustments = isAdmin;
  const showStockLocations = isAdmin;
  const showSuppliers = isAdmin;
  const showCustomers = isAdmin;
  const showLocations = isAdmin;
  const showPurchaseOrders = isAdmin || isSeller;
  const showSalesOrders = isAdmin || isBuyer;
  const showReturns = isAdmin;
  const showAuditLogs = isAdmin;
  const basePath = isAdmin ? '/admin' : isSeller ? '/seller' : '/buyer';
  const sectionFromPath = location.pathname.replace(basePath, '').split('/').filter(Boolean)[0];
  const activeSection = sectionFromPath || 'dashboard';
  const PAGE_SIZE = 10;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemsPage, setItemsPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [valuation, setValuation] = useState<ReportValuation | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [transactionsPage, setTransactionsPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersPage, setSuppliersPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersPage, setCustomersPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsPage, setLocationsPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [purchaseOrdersPage, setPurchaseOrdersPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [salesOrdersPage, setSalesOrdersPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [returns, setReturns] = useState<ReturnEntry[]>([]);
  const [returnsPage, setReturnsPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [stocksPage, setStocksPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditPage, setAuditPage] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1
  });
  const [pendingUsers, setPendingUsers] = useState<
    Array<{
      _id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      phone?: string;
      address?: string;
      companyName?: string;
    }>
  >([]);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    companyName: user?.companyName ?? '',
    gstNumber: user?.gstNumber ?? ''
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      companyName: user?.companyName ?? '',
      gstNumber: user?.gstNumber ?? ''
    });
  }, [user]);
  const userStatusChartRef = useRef<HTMLCanvasElement | null>(null);
  const purchaseStatusChartRef = useRef<HTMLCanvasElement | null>(null);
  const salesStatusChartRef = useRef<HTMLCanvasElement | null>(null);
  const monthlyChartRef = useRef<HTMLCanvasElement | null>(null);
  const topItemsChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const scatterChartRef = useRef<HTMLCanvasElement | null>(null);
  const histogramChartRef = useRef<HTMLCanvasElement | null>(null);
  const sellerStatusChartRef = useRef<HTMLCanvasElement | null>(null);
  const sellerMonthlyChartRef = useRef<HTMLCanvasElement | null>(null);
  const buyerStatusChartRef = useRef<HTMLCanvasElement | null>(null);
  const buyerMonthlyChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstancesRef = useRef<Record<string, { destroy: () => void }>>({});

  const loadItems = useCallback(async (pageOverride?: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getItems({
        search: query.trim() || undefined,
        category: category || undefined,
        lowStock: lowStockOnly,
        page: pageOverride ?? itemsPage.page,
        limit: PAGE_SIZE
      });
      setItems(result.data);
      setItemsPage(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  }, [category, lowStockOnly, query, itemsPage.page]);

  const loadDashboard = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    try {
      const [dashboardData, transactionsData, stocksData, auditData] = await Promise.all([
        getAdminDashboard(),
        getTransactions({ page: transactionsPage.page, limit: PAGE_SIZE }),
        getStocks({ page: stocksPage.page, limit: PAGE_SIZE }),
        getAuditLogs({ page: auditPage.page, limit: PAGE_SIZE })
      ]);
      setDashboard(dashboardData);
      setSummary(dashboardData.inventory.summary);
      setValuation(dashboardData.inventory.valuation);
      setTransactions(transactionsData.data);
      setTransactionsPage(transactionsData.pagination);
      setStocks(stocksData.data);
      setStocksPage(stocksData.pagination);
      setAuditLogs(auditData.data);
      setAuditPage(auditData.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    }
  }, [transactionsPage.page, stocksPage.page, auditPage.page, isAdmin]);

  const loadSuppliers = useCallback(
    async (pageOverride?: number) => {
      if (!showSuppliers) return;
      const result = await getSuppliers({ page: pageOverride ?? suppliersPage.page, limit: PAGE_SIZE });
      setSuppliers(result.data);
      setSuppliersPage(result.pagination);
    },
    [showSuppliers, suppliersPage.page]
  );

  const loadCustomers = useCallback(
    async (pageOverride?: number) => {
      if (!showCustomers) return;
      const result = await getCustomers({ page: pageOverride ?? customersPage.page, limit: PAGE_SIZE });
      setCustomers(result.data);
      setCustomersPage(result.pagination);
    },
    [showCustomers, customersPage.page]
  );

  const loadLocations = useCallback(
    async (pageOverride?: number) => {
      if (!showLocations) return;
      const result = await getLocations({ page: pageOverride ?? locationsPage.page, limit: PAGE_SIZE });
      setLocations(result.data);
      setLocationsPage(result.pagination);
    },
    [showLocations, locationsPage.page]
  );

  const loadPurchaseOrders = useCallback(
    async (pageOverride?: number) => {
      if (!showPurchaseOrders) return;
      const result = await getPurchaseOrders({
        page: pageOverride ?? purchaseOrdersPage.page,
        limit: PAGE_SIZE
      });
      setPurchaseOrders(result.data);
      setPurchaseOrdersPage(result.pagination);
    },
    [showPurchaseOrders, purchaseOrdersPage.page]
  );

  const loadSalesOrders = useCallback(
    async (pageOverride?: number) => {
      if (!showSalesOrders) return;
      const result = await getSalesOrders({ page: pageOverride ?? salesOrdersPage.page, limit: PAGE_SIZE });
      setSalesOrders(result.data);
      setSalesOrdersPage(result.pagination);
    },
    [showSalesOrders, salesOrdersPage.page]
  );

  const loadReturns = useCallback(
    async (pageOverride?: number) => {
      if (!showReturns) return;
      const result = await getReturns({ page: pageOverride ?? returnsPage.page, limit: PAGE_SIZE });
      setReturns(result.data);
      setReturnsPage(result.pagination);
    },
    [showReturns, returnsPage.page]
  );

  const loadAuditLogs = useCallback(
    async (pageOverride?: number) => {
      if (!showAuditLogs) return;
      const result = await getAuditLogs({ page: pageOverride ?? auditPage.page, limit: PAGE_SIZE });
      setAuditLogs(result.data);
      setAuditPage(result.pagination);
    },
    [showAuditLogs, auditPage.page]
  );

  const loadPendingUsers = useCallback(async () => {
    if (!isAdmin) return;
    const users = await getPendingUsers();
    setPendingUsers(users);
  }, [isAdmin]);

  const loadCompanySettings = useCallback(async () => {
    if (!isAdmin) return;
    const settings = await getCompanySettings();
    setCompanySettings(settings);
  }, [isAdmin]);

  const loadSectionData = useCallback(
    async (section: string) => {
      try {
        switch (section) {
          case 'dashboard':
            if (isAdmin) {
              await loadDashboard();
            } else if (isSeller) {
              await loadPurchaseOrders();
            } else {
              await loadSalesOrders();
            }
            break;
          case 'inventory':
            if (showInventory) await loadItems();
            break;
          case 'adjustments':
            if (showAdjustments) {
              await loadItems();
              await loadLocations();
              await loadDashboard();
            }
            break;
          case 'stock-locations':
            if (showStockLocations) await loadDashboard();
            break;
          case 'suppliers':
            if (showSuppliers) await loadSuppliers();
            break;
          case 'customers':
            if (showCustomers) await loadCustomers();
            break;
          case 'locations':
            if (showLocations) await loadLocations();
            break;
          case 'purchase-orders':
            if (showPurchaseOrders) {
              await loadPurchaseOrders();
              await loadItems();
              if (isAdmin) await loadSuppliers();
            }
            break;
          case 'sales-orders':
            if (showSalesOrders) {
              await loadSalesOrders();
              await loadItems();
              if (isAdmin) await loadCustomers();
            }
            break;
          case 'returns':
            if (showReturns) {
              await loadReturns();
              await loadItems();
            }
            break;
          case 'audit-logs':
            if (showAuditLogs) await loadAuditLogs();
            break;
          case 'user-onboarding':
            if (isAdmin) await loadPendingUsers();
            break;
          case 'company-settings':
            if (isAdmin) await loadCompanySettings();
            break;
          case 'profile':
            break;
          default:
            break;
        }
      } catch (err) {
        const msg = getErrorMessage(err, 'Failed to load data.');
        setError(msg);
        showError('Load failed', msg);
      }
    },
    [
      isAdmin,
      isSeller,
      showInventory,
      showAdjustments,
      showStockLocations,
      showSuppliers,
      showCustomers,
      showLocations,
      showPurchaseOrders,
      showSalesOrders,
      showReturns,
      showAuditLogs,
      loadDashboard,
      loadItems,
      loadLocations,
      loadSuppliers,
      loadCustomers,
      loadPurchaseOrders,
      loadSalesOrders,
      loadReturns,
      loadAuditLogs,
      loadPendingUsers,
      loadCompanySettings
    ]
  );

  const handleCompanySave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!companySettings) return;
    setBusy(true);
    try {
      const saved = await updateCompanySettings(companySettings);
      setCompanySettings(saved);
      showSuccess('Company details updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update company details.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const updated = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone || undefined,
        address: profileForm.address || undefined,
        companyName: profileForm.companyName || undefined,
        gstNumber: profileForm.gstNumber || undefined
      });
      updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        phone: updated.phone,
        address: updated.address,
        companyName: updated.companyName,
        gstNumber: updated.gstNumber,
        supplierId: updated.supplierId,
        customerId: updated.customerId
      });
      showSuccess('Profile updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update profile.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!location.pathname.startsWith(basePath)) {
      navigate(`${basePath}/dashboard`, { replace: true });
      return;
    }
    void loadSectionData(activeSection);
  }, [activeSection, basePath, location.pathname, loadSectionData, navigate]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleCreate = async (payload: InventoryPayload) => {
    setBusy(true);
    setError(null);
    try {
      await createItem(payload);
      setItemsPage((prev) => ({ ...prev, page: 1 }));
      await loadItems();
      void loadDashboard();
      showSuccess('Item created');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create item.');
      setError(msg);
      showError('Create failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (payload: InventoryPayload) => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      await updateItem(editing._id, payload);
      await loadItems();
      setEditing(null);
      void loadDashboard();
      showSuccess('Item updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update item.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteItem(item._id);
      await loadItems();
      void loadDashboard();
      showSuccess('Item deleted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete item.');
      setError(msg);
      showError('Delete failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleAdjust = async (payload: InventoryAdjustmentPayload) => {
    setBusy(true);
    setError(null);
    try {
      await adjustStock(payload);
      await loadItems();
      void loadDashboard();
      showSuccess('Stock adjusted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to adjust stock.');
      setError(msg);
      showError('Adjustment failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSupplierCreate = async (payload: SupplierPayload) => {
    setBusy(true);
    try {
      await createSupplier(payload);
      setSuppliersPage((prev) => ({ ...prev, page: 1 }));
      await loadSectionData(activeSection);
      showSuccess('Supplier created');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create supplier.');
      setError(msg);
      showError('Create failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSupplierUpdate = async (id: string, payload: SupplierPayload) => {
    setBusy(true);
    try {
      await updateSupplier(id, payload);
      await loadSectionData(activeSection);
      showSuccess('Supplier updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update supplier.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSupplierDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteSupplier(id);
      await loadSectionData(activeSection);
      showSuccess('Supplier deleted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete supplier.');
      setError(msg);
      showError('Delete failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleCustomerCreate = async (payload: CustomerPayload) => {
    setBusy(true);
    try {
      await createCustomer(payload);
      setCustomersPage((prev) => ({ ...prev, page: 1 }));
      await loadSectionData(activeSection);
      showSuccess('Customer created');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create customer.');
      setError(msg);
      showError('Create failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleCustomerUpdate = async (id: string, payload: CustomerPayload) => {
    setBusy(true);
    try {
      await updateCustomer(id, payload);
      await loadSectionData(activeSection);
      showSuccess('Customer updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update customer.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleCustomerDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteCustomer(id);
      await loadSectionData(activeSection);
      showSuccess('Customer deleted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete customer.');
      setError(msg);
      showError('Delete failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleLocationCreate = async (payload: LocationPayload) => {
    setBusy(true);
    try {
      await createLocation(payload);
      setLocationsPage((prev) => ({ ...prev, page: 1 }));
      await loadSectionData(activeSection);
      showSuccess('Location created');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create location.');
      setError(msg);
      showError('Create failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleLocationUpdate = async (id: string, payload: LocationPayload) => {
    setBusy(true);
    try {
      await updateLocation(id, payload);
      await loadSectionData(activeSection);
      showSuccess('Location updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update location.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleLocationDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteLocation(id);
      await loadSectionData(activeSection);
      showSuccess('Location deleted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete location.');
      setError(msg);
      showError('Delete failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handlePurchaseCreate = async (payload: PurchaseOrderPayload) => {
    setBusy(true);
    try {
      await createPurchaseOrder(payload);
      setPurchaseOrdersPage((prev) => ({ ...prev, page: 1 }));
      await loadSectionData(activeSection);
      showSuccess('Purchase request created');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create purchase request.');
      setError(msg);
      showError('Create failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handlePurchaseDelete = async (id: string) => {
    setBusy(true);
    try {
      await deletePurchaseOrder(id);
      await loadSectionData(activeSection);
      showSuccess('Purchase order deleted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete purchase order.');
      setError(msg);
      showError('Delete failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handlePurchaseUpdate = async (id: string, payload: Partial<PurchaseOrderPayload>) => {
    setBusy(true);
    try {
      await updatePurchaseOrder(id, payload);
      await loadSectionData(activeSection);
      await loadDashboard();
      showSuccess('Purchase order updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update purchase order.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handlePurchaseSupplierRespond = async (
    id: string,
    payload: Partial<PurchaseOrderPayload>
  ) => {
    setBusy(true);
    try {
      await updatePurchaseOrder(id, { ...payload, status: 'supplier_submitted' });
      await loadSectionData(activeSection);
      showSuccess('Details submitted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to submit details.');
      setError(msg);
      showError('Submit failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const openPdfBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const downloadPdfBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handlePurchasePdfView = async (id: string) => {
    const blob = await getPurchaseOrderPdf(id);
    openPdfBlob(blob);
  };

  const handlePurchasePdfDownload = async (id: string) => {
    const blob = await getPurchaseOrderPdf(id);
    downloadPdfBlob(blob, `purchase-order-${id}.pdf`);
  };

  const handleSalesCreate = async (payload: SalesOrderPayload) => {
    setBusy(true);
    try {
      await createSalesOrder(payload);
      setSalesOrdersPage((prev) => ({ ...prev, page: 1 }));
      await loadSectionData(activeSection);
      showSuccess('Sales request created');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create sales request.');
      setError(msg);
      showError('Create failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSalesDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteSalesOrder(id);
      await loadSectionData(activeSection);
      showSuccess('Sales order deleted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete sales order.');
      setError(msg);
      showError('Delete failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSalesUpdate = async (id: string, payload: Partial<SalesOrderPayload>) => {
    setBusy(true);
    try {
      await updateSalesOrder(id, payload);
      await loadSectionData(activeSection);
      await loadDashboard();
      showSuccess('Sales order updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update sales order.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSalesPdfView = async (id: string) => {
    const blob = await getSalesOrderPdf(id);
    openPdfBlob(blob);
  };

  const handleSalesPdfDownload = async (id: string) => {
    const blob = await getSalesOrderPdf(id);
    downloadPdfBlob(blob, `sales-order-${id}.pdf`);
  };

  const handleReturnCreate = async (payload: ReturnPayload) => {
    setBusy(true);
    try {
      await createReturn(payload);
      setReturnsPage((prev) => ({ ...prev, page: 1 }));
      await loadSectionData(activeSection);
      showSuccess('Return created');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create return.');
      setError(msg);
      showError('Create failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleReturnDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteReturn(id);
      await loadSectionData(activeSection);
      showSuccess('Return deleted');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete return.');
      setError(msg);
      showError('Delete failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleReturnUpdate = async (id: string, status: ReturnPayload['status']) => {
    setBusy(true);
    try {
      await updateReturn(id, { status });
      await loadSectionData(activeSection);
      await loadDashboard();
      showSuccess('Return updated');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update return.');
      setError(msg);
      showError('Update failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleApproveUser = async (id: string) => {
    setBusy(true);
    try {
      await approveUser(id);
      const users = await getPendingUsers();
      setPendingUsers(users);
      await loadSectionData(activeSection);
      showSuccess('User approved');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to approve user.');
      setError(msg);
      showError('Approve failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleRejectUser = async (id: string) => {
    setBusy(true);
    try {
      await rejectUser(id);
      const users = await getPendingUsers();
      setPendingUsers(users);
      showSuccess('User rejected');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to reject user.');
      setError(msg);
      showError('Reject failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleItemsPageChange = (page: number) => {
    setItemsPage((prev) => ({ ...prev, page }));
    void loadItems(page);
  };
  const handleTransactionsPageChange = (page: number) => {
    setTransactionsPage((prev) => ({ ...prev, page }));
    if (isAdmin) void loadDashboard();
  };
  const handleSuppliersPageChange = (page: number) => {
    setSuppliersPage((prev) => ({ ...prev, page }));
    void loadSuppliers(page);
  };
  const handleCustomersPageChange = (page: number) => {
    setCustomersPage((prev) => ({ ...prev, page }));
    void loadCustomers(page);
  };
  const handleLocationsPageChange = (page: number) => {
    setLocationsPage((prev) => ({ ...prev, page }));
    void loadLocations(page);
  };
  const handlePurchaseOrdersPageChange = (page: number) => {
    setPurchaseOrdersPage((prev) => ({ ...prev, page }));
    void loadPurchaseOrders(page);
  };
  const handleSalesOrdersPageChange = (page: number) => {
    setSalesOrdersPage((prev) => ({ ...prev, page }));
    void loadSalesOrders(page);
  };
  const handleReturnsPageChange = (page: number) => {
    setReturnsPage((prev) => ({ ...prev, page }));
    void loadReturns(page);
  };
  const handleStocksPageChange = (page: number) => {
    setStocksPage((prev) => ({ ...prev, page }));
    if (isAdmin) void loadDashboard();
  };
  const handleAuditPageChange = (page: number) => {
    setAuditPage((prev) => ({ ...prev, page }));
    void loadAuditLogs(page);
  };

  const handleExport = async () => {
    try {
      const csv = await exportItemsCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'items.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importItemsCsv(file);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      event.target.value = '';
    }
  };

  const categories = useMemo(() => {
    const values = new Set(items.map((item) => item.category).filter(Boolean));
    return Array.from(values).sort();
  }, [items]);

  const itemsCount = useCountUp(summary?.totalItems ?? 0);
  const totalQty = useCountUp(summary?.totalQuantity ?? 0);
  const lowStockCount = useCountUp(summary?.lowStockCount ?? 0);
  const stockValue = useCountUp(valuation?.totalValue ?? 0);
  const stockCost = useCountUp(valuation?.totalCost ?? 0);

  const headerTitle = sectionLabelMap[activeSection] ?? 'Dashboard';
  const headerSubtitle = isAdmin
    ? companySettings?.tagline ?? 'Manage stock, pricing, and workflows in one place.'
    : isSeller
      ? 'Track sales orders and fulfillment.'
      : 'Track purchase orders and deliveries.';

  const currency = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }),
    []
  );

  const formatCurrency = (value: number) => currency.format(Number.isFinite(value) ? value : 0);

  const purchaseStatus = dashboard?.purchaseOrders.statusCounts ?? {};
  const salesStatus = dashboard?.salesOrders.statusCounts ?? {};
  const locationRows = dashboard?.locations ?? [];
  const purchaseTotal = dashboard?.purchaseOrders.total ?? 0;
  const salesTotal = dashboard?.salesOrders.total ?? 0;
  const purchaseSubtotal = dashboard?.purchaseOrders.subtotal ?? 0;
  const salesSubtotal = dashboard?.salesOrders.subtotal ?? 0;
  const gstTotal = (dashboard?.salesOrders.gst ?? 0) + (dashboard?.purchaseOrders.gst ?? 0);
  const funnelPurchase = [
    { label: 'Requested', value: purchaseStatus.requested ?? 0 },
    { label: 'Supplier Submitted', value: purchaseStatus.supplier_submitted ?? 0 },
    { label: 'Approved', value: purchaseStatus.approved ?? 0 },
    { label: 'Received', value: purchaseStatus.received ?? 0 }
  ];
  const funnelSales = [
    { label: 'Requested', value: salesStatus.requested ?? 0 },
    { label: 'Approved', value: salesStatus.approved ?? 0 },
    { label: 'Received', value: salesStatus.received ?? 0 }
  ];

  const scatterItems = (dashboard?.topItems ?? []).map((item) => ({
    x: items.find((i) => i._id === item.itemId)?.price ?? 0,
    y: item.quantity
  }));
  const histogramBuckets = useMemo(() => {
    if (!items.length) return [];
    const values = items.map((item) => item.quantity);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const bucketCount = 8;
    const size = Math.max(1, Math.ceil((max - min) / bucketCount));
    const buckets = Array.from({ length: bucketCount }, (_, idx) => ({
      label: `${min + idx * size}-${min + (idx + 1) * size}`,
      value: 0
    }));
    values.forEach((value) => {
      const index = Math.min(Math.floor((value - min) / size), bucketCount - 1);
      buckets[index].value += 1;
    });
    return buckets;
  }, [items]);

  const priceStats = useMemo(() => {
    if (!items.length) return null;
    const values = items.map((item) => item.price).sort((a, b) => a - b);
    const percentile = (p: number) => {
      const idx = Math.floor((values.length - 1) * p);
      return values[idx] ?? 0;
    };
    return {
      min: values[0],
      q1: percentile(0.25),
      median: percentile(0.5),
      q3: percentile(0.75),
      max: values[values.length - 1]
    };
  }, [items]);

  useEffect(() => {
    if (activeSection !== 'dashboard') return;
    const Chart = window.Chart;
    if (!Chart) return;

    const createChart = (key: string, canvas: HTMLCanvasElement | null, config: Record<string, unknown>) => {
      if (!canvas) return;
      chartInstancesRef.current[key]?.destroy();
      chartInstancesRef.current[key] = new Chart(canvas, config);
    };

    if (isAdmin && dashboard) {
      const userData = [
        dashboard.users.pending,
        dashboard.users.approved,
        dashboard.users.rejected
      ];

      createChart('userStatus', userStatusChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Approved', 'Rejected'],
          datasets: [
            {
              data: userData,
              backgroundColor: ['#f59e0b', '#22c55e', '#ef4444']
            }
          ]
        },
        options: {
          plugins: { legend: { position: 'bottom' } }
        }
      });

      const purchaseOrderLabels = ['requested', 'supplier_submitted', 'approved', 'received'];
      createChart('purchaseStatus', purchaseStatusChartRef.current, {
        type: 'bar',
        data: {
          labels: purchaseOrderLabels.map((label) => label.replace('_', ' ')),
          datasets: [
            {
              label: 'Purchase Orders',
              data: purchaseOrderLabels.map((label) => purchaseStatus[label] ?? 0),
              backgroundColor: '#3b82f6'
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      const salesOrderLabels = ['requested', 'approved', 'received'];
      createChart('salesStatus', salesStatusChartRef.current, {
        type: 'bar',
        data: {
          labels: salesOrderLabels.map((label) => label.replace('_', ' ')),
          datasets: [
            {
              label: 'Sales Orders',
              data: salesOrderLabels.map((label) => salesStatus[label] ?? 0),
              backgroundColor: '#f97316'
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      const monthLabels = dashboard.monthly.map((row) => row.month);
      createChart('monthly', monthlyChartRef.current, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [
            {
              type: 'bar',
              label: 'PO Total',
              data: dashboard.monthly.map((row) => row.purchaseTotal),
              backgroundColor: 'rgba(59, 130, 246, 0.65)'
            },
            {
              type: 'line',
              label: 'SO Total',
              data: dashboard.monthly.map((row) => row.salesTotal),
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              fill: true,
              tension: 0.35
            }
          ]
        },
        options: {
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true } }
        }
      });

      createChart('topItems', topItemsChartRef.current, {
        type: 'bar',
        data: {
          labels: dashboard.topItems.map((item) => item.name),
          datasets: [
            {
              label: 'Quantity',
              data: dashboard.topItems.map((item) => item.quantity),
              backgroundColor: '#8b5cf6'
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      createChart('category', categoryChartRef.current, {
        type: 'bar',
        data: {
          labels: dashboard.categorySummary.map((row) => row.category),
          datasets: [
            {
              label: 'Value',
              data: dashboard.categorySummary.map((row) => row.value),
              backgroundColor: '#14b8a6'
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      createChart('scatter', scatterChartRef.current, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Price vs Quantity',
              data: scatterItems,
              backgroundColor: 'rgba(59, 130, 246, 0.7)'
            }
          ]
        },
        options: {
          scales: {
            x: { title: { display: true, text: 'Price' } },
            y: { title: { display: true, text: 'Quantity' }, beginAtZero: true }
          }
        }
      });

      createChart('histogram', histogramChartRef.current, {
        type: 'bar',
        data: {
          labels: histogramBuckets.map((bucket) => bucket.label),
          datasets: [
            {
              label: 'Items',
              data: histogramBuckets.map((bucket) => bucket.value),
              backgroundColor: '#0ea5e9'
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    if (isSeller) {
      const counts = {
        requested: purchaseOrders.filter((o) => o.status === 'requested').length,
        supplier_submitted: purchaseOrders.filter((o) => o.status === 'supplier_submitted').length,
        approved: purchaseOrders.filter((o) => o.status === 'approved').length,
        received: purchaseOrders.filter((o) => o.status === 'received').length
      };

      createChart('sellerStatus', sellerStatusChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Requested', 'Supplier Submitted', 'Approved', 'Received'],
          datasets: [
            {
              label: 'Purchase Orders',
              data: [counts.requested, counts.supplier_submitted, counts.approved, counts.received],
              backgroundColor: '#3b82f6'
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      const monthly = purchaseOrders.reduce<Record<string, number>>((acc, order) => {
        const raw = order.createdAt ?? order.expectedDate ?? order.deliveryDate;
        const key = raw ? String(raw).slice(0, 7) : 'Unknown';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(monthly).sort();
      createChart('sellerMonthly', sellerMonthlyChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Orders',
              data: labels.map((label) => monthly[label]),
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              fill: true,
              tension: 0.35
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    if (isBuyer) {
      const counts = {
        requested: salesOrders.filter((o) => o.status === 'requested').length,
        approved: salesOrders.filter((o) => o.status === 'approved').length,
        received: salesOrders.filter((o) => o.status === 'received').length
      };

      createChart('buyerStatus', buyerStatusChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Requested', 'Approved', 'Received'],
          datasets: [
            {
              label: 'Sales Orders',
              data: [counts.requested, counts.approved, counts.received],
              backgroundColor: '#f97316'
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      const monthly = salesOrders.reduce<Record<string, number>>((acc, order) => {
        const raw = order.createdAt ?? order.deliveryDate;
        const key = raw ? String(raw).slice(0, 7) : 'Unknown';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(monthly).sort();
      createChart('buyerMonthly', buyerMonthlyChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Orders',
              data: labels.map((label) => monthly[label]),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              fill: true,
              tension: 0.35
            }
          ]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    return () => {
      Object.values(chartInstancesRef.current).forEach((chart) => chart.destroy());
      chartInstancesRef.current = {};
    };
  }, [
    activeSection,
    dashboard,
    histogramBuckets,
    isAdmin,
    isSeller,
    isBuyer,
    purchaseOrders,
    salesOrders,
    scatterItems
  ]);

  return (
    <div className={`app-shell ${roleClass}${sidebarCollapsed ? ' sidebar-collapsed' : ''}${sidebarOpen ? ' sidebar-open' : ''}`}>
      <Sidebar
        activeSection={activeSection}
        role={user?.role}
        basePath={basePath}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onNavigate={() => setSidebarOpen(false)}
        company={companySettings}
      />
      <button
        type="button"
        className={`sidebar-backdrop${sidebarOpen ? ' show' : ''}`}
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />
      <div className="app">
        <div className="container-fluid">
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          currentSection={sectionLabelMap[activeSection]}
          onLogout={logout}
          userName={user?.name}
          userRole={user?.role}
          showAdminActions={isAdmin}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {showInventory && activeSection === 'inventory' ? (
        <div className="filters row g-2 align-items-center">
          <div className="col-12 col-md-5 col-lg-4">
            <input
              className="form-control"
              placeholder="Search by name, SKU, description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3 col-lg-3">
            <label className="toggle form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              <span className="form-check-label">Low stock only</span>
            </label>
          </div>
        </div>
        ) : null}

        {error ? <div className="banner error">{error}</div> : null}

        {activeSection === 'dashboard' ? (
        <section id="dashboard" className="section">
          {isAdmin ? (
            <>
              <div className="container-fluid p-0 kpi-section">
                <div className="row">
                  <div className="col-12">
                    <h5 className="mb-2">Inventory KPIs</h5>
                  </div>
                </div>
                <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-5 kpi-group">
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-blue">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 4h16v4H4zM4 10h10v4H4zM4 16h16v4H4z" />
                      </svg>
                    </div>
                    <span className="label">Items</span>
                    <strong>{Math.round(itemsCount)}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-green">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 12h4l2-4 4 8 2-4h4" />
                      </svg>
                    </div>
                    <span className="label">Total Qty</span>
                    <strong>{Math.round(totalQty)}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-orange">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 3 2 21h20L12 3Zm0 6v6m0 4h.01" />
                      </svg>
                    </div>
                    <span className="label">Low Stock</span>
                    <strong>{Math.round(lowStockCount)}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-purple">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16v12H4zM8 6v12" />
                      </svg>
                    </div>
                    <span className="label">Stock Value</span>
                    <strong>{formatCurrency(stockValue)}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-teal">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2v20M5 12h14" />
                      </svg>
                    </div>
                    <span className="label">Stock Cost</span>
                    <strong>{formatCurrency(stockCost)}</strong>
                  </div>
                </div>
                </div>
              </div>
              <div className="container-fluid p-0 kpi-section">
                <div className="row">
                  <div className="col-12">
                    <h5 className="mb-2">Users & Partners</h5>
                  </div>
                </div>
                <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-5 kpi-group">
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-blue">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 4h16v16H4zM8 8h8v8H8z" />
                      </svg>
                    </div>
                    <span className="label">Pending Users</span>
                    <strong>{dashboard?.users.pending ?? 0}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-green">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 12l4 4 8-8" />
                      </svg>
                    </div>
                    <span className="label">Approved Users</span>
                    <strong>{dashboard?.users.approved ?? 0}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-orange">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 5l14 14M19 5L5 19" />
                      </svg>
                    </div>
                    <span className="label">Rejected Users</span>
                    <strong>{dashboard?.users.rejected ?? 0}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-purple">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16M4 12h16M4 17h16" />
                      </svg>
                    </div>
                    <span className="label">Suppliers</span>
                    <strong>{dashboard?.suppliers.count ?? 0}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-teal">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 8h12M6 12h12M6 16h12" />
                      </svg>
                    </div>
                    <span className="label">Customers</span>
                    <strong>{dashboard?.customers.count ?? 0}</strong>
                  </div>
                </div>
                </div>
              </div>
              <div className="container-fluid p-0 kpi-section">
                <div className="row">
                  <div className="col-12">
                    <h5 className="mb-2">Orders & Profit</h5>
                  </div>
                </div>
                <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 kpi-group">
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-green">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2v20M6 8h12" />
                      </svg>
                    </div>
                    <span className="label">PO Total (Incl. GST)</span>
                    <strong>{formatCurrency(purchaseTotal)}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-blue">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2v20M6 16h12" />
                      </svg>
                    </div>
                    <span className="label">SO Total (Incl. GST)</span>
                    <strong>{formatCurrency(salesTotal)}</strong>
                  </div>
                </div>
                <div className="col">
                  <div className="stat">
                    <div className="kpi-icon kpi-purple">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 12h6l3 6 3-12 3 6h3" />
                      </svg>
                    </div>
                    <span className="label">Net Profit</span>
                    <strong>{formatCurrency(dashboard?.profit.net ?? 0)}</strong>
                  </div>
                </div>
                </div>
              </div>
              <div className=" my-3">
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">User Onboarding</h6>
                        <div className="metric-row">
                          <span className="muted">Total</span>
                          <strong>{dashboard?.users.total ?? 0}</strong>
                        </div>
                        <div className="bar-list">
                          {[
                            { label: 'Pending', value: dashboard?.users.pending ?? 0 },
                            { label: 'Approved', value: dashboard?.users.approved ?? 0 },
                            { label: 'Rejected', value: dashboard?.users.rejected ?? 0 }
                          ].map((row) => {
                            const max = Math.max(
                              dashboard?.users.pending ?? 0,
                              dashboard?.users.approved ?? 0,
                              dashboard?.users.rejected ?? 0,
                              1
                            );
                            return (
                              <div key={row.label} className="bar-row">
                                <span>{row.label}</span>
                                <div className="bar-track">
                                  <div
                                    className="bar-fill"
                                    style={{ width: `${(row.value / max) * 100}%` }}
                                  />
                                </div>
                                <strong>{row.value}</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Purchase Orders</h6>
                        <div className="metric-row">
                          <span className="muted">Orders</span>
                          <strong>{dashboard?.purchaseOrders.count ?? 0}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">Total Qty</span>
                          <strong>{dashboard?.purchaseOrders.totalQty ?? 0}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">Subtotal</span>
                          <strong>{formatCurrency(dashboard?.purchaseOrders.subtotal ?? 0)}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">GST</span>
                          <strong>{formatCurrency(dashboard?.purchaseOrders.gst ?? 0)}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">Total</span>
                          <strong>{formatCurrency(dashboard?.purchaseOrders.total ?? 0)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Sales Orders</h6>
                        <div className="metric-row">
                          <span className="muted">Orders</span>
                          <strong>{dashboard?.salesOrders.count ?? 0}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">Total Qty</span>
                          <strong>{dashboard?.salesOrders.totalQty ?? 0}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">Subtotal</span>
                          <strong>{formatCurrency(dashboard?.salesOrders.subtotal ?? 0)}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">GST</span>
                          <strong>{formatCurrency(dashboard?.salesOrders.gst ?? 0)}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">Total</span>
                          <strong>{formatCurrency(dashboard?.salesOrders.total ?? 0)}</strong>
                        </div>
                        <div className="metric-row">
                          <span className="muted">Margin</span>
                          <strong>{((dashboard?.profit.margin ?? 0) * 100).toFixed(1)}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Sales Status</h6>
                        <div className="bar-list">
                          {Object.entries(salesStatus).map(([label, value]) => {
                            const max = Math.max(...Object.values(salesStatus), 1);
                            return (
                              <div key={label} className="bar-row">
                                <span>{label.replace('_', ' ')}</span>
                                <div className="bar-track">
                                  <div
                                    className="bar-fill bar-fill-accent"
                                    style={{ width: `${(value / max) * 100}%` }}
                                  />
                                </div>
                                <strong>{value}</strong>
                              </div>
                            );
                          })}
                          {!Object.keys(salesStatus).length ? (
                            <div className="muted small">No sales order data</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Location Stock</h6>
                        <div className="bar-list">
                          {locationRows.slice(0, 6).map((row) => {
                            const max = Math.max(...locationRows.map((r) => r.totalQuantity), 1);
                            return (
                              <div key={row.locationId} className="bar-row">
                                <span>{row.locationName}</span>
                                <div className="bar-track">
                                  <div
                                    className="bar-fill bar-fill-secondary"
                                    style={{ width: `${(row.totalQuantity / max) * 100}%` }}
                                  />
                                </div>
                                <strong>{row.totalQuantity}</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Purchase Status</h6>
                        <div className="bar-list">
                          {Object.entries(purchaseStatus).map(([label, value]) => {
                            const max = Math.max(...Object.values(purchaseStatus), 1);
                            return (
                              <div key={label} className="bar-row">
                                <span>{label.replace('_', ' ')}</span>
                                <div className="bar-track">
                                  <div
                                    className="bar-fill"
                                    style={{ width: `${(value / max) * 100}%` }}
                                  />
                                </div>
                                <strong>{value}</strong>
                              </div>
                            );
                          })}
                          {!Object.keys(purchaseStatus).length ? (
                            <div className="muted small">No purchase order data</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" my-3">
                {/* Row 1 */}
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Sales Order Status</h6>
                        <div style={{ height: 320 }}>
                          <canvas ref={salesStatusChartRef} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Monthly PO vs SO (Incl. GST)</h6>
                        <div style={{ height: 320 }}>
                          <canvas ref={monthlyChartRef} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Top Items by Quantity</h6>
                        <div style={{ height: 320 }}>
                          <canvas ref={topItemsChartRef} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Inventory by Category</h6>
                        <div style={{ height: 320 }}>
                          <canvas ref={categoryChartRef} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Price vs Quantity (Scatter)</h6>
                        <div style={{ height: 320 }}>
                          <canvas ref={scatterChartRef} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Quantity Distribution (Histogram)</h6>
                        <div style={{ height: 320 }}>
                          <canvas ref={histogramChartRef} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Waterfall (Sales → GST → Net Profit)</h6>

                        <ul className="list-group">
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>Sales Subtotal</span>
                            <strong>{formatCurrency(salesSubtotal)}</strong>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>GST Total</span>
                            <strong>{formatCurrency(gstTotal)}</strong>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>Purchase Subtotal</span>
                            <strong className="text-danger">{formatCurrency(purchaseSubtotal)}</strong>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                            <span>Net Profit</span>
                            <strong>{formatCurrency(dashboard?.profit.net ?? 0)}</strong>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">PO Funnel</h6>

                        <div className="vstack gap-2">
                          {funnelPurchase.map((step) => (
                            <div key={step.label} className="d-flex justify-content-between border-bottom pb-2">
                              <span>{step.label}</span>
                              <strong>{step.value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">SO Funnel</h6>

                        <div className="vstack gap-2">
                          {funnelSales.map((step) => (
                            <div key={step.label} className="d-flex justify-content-between border-bottom pb-2">
                              <span>{step.label}</span>
                              <strong>{step.value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Price Distribution (Box Plot)</h6>

                        {priceStats ? (
                          <>
                            <div className="d-flex justify-content-between small mb-2">
                              <span>{formatCurrency(priceStats.min)}</span>
                              <span>{formatCurrency(priceStats.max)}</span>
                            </div>

                            <div className="progress" style={{ height: 12 }}>
                              <div
                                className="progress-bar bg-secondary"
                                style={{
                                  width: `${((priceStats.q3 - priceStats.q1) / (priceStats.max - priceStats.min || 1)) * 100}%`,
                                  marginLeft: `${((priceStats.q1 - priceStats.min) / (priceStats.max - priceStats.min || 1)) * 100}%`
                                }}
                              />
                            </div>

                            <div className="d-flex justify-content-between small mt-2">
                              <span>Q1 {formatCurrency(priceStats.q1)}</span>
                              <span>Median {formatCurrency(priceStats.median)}</span>
                              <span>Q3 {formatCurrency(priceStats.q3)}</span>
                            </div>
                          </>
                        ) : (
                          <small className="text-muted">No price data</small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 6 */}
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Sales Decomposition (Top Customers)</h6>

                        <div className="table-responsive">
                          <table className="table table-sm table-striped align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Customer</th>
                                <th className="text-end">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboard?.salesByCustomer.map((row) => (
                                <tr key={row.customerId}>
                                  <td>{row.customerName}</td>
                                  <td className="text-end">{formatCurrency(row.subtotal)}</td>
                                </tr>
                              ))}

                              {!dashboard?.salesByCustomer.length && (
                                <tr>
                                  <td colSpan={2}>No customer sales</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Key Influencers</h6>

                        <ul className="list-group">
                          <li className="list-group-item">
                            <div className="fw-semibold">Low Stock Items</div>
                            <small className="text-muted">{summary?.lowStockCount ?? 0} items below threshold</small>
                          </li>

                          <li className="list-group-item">
                            <div className="fw-semibold">Top Sales Items</div>
                            <small className="text-muted">{dashboard?.salesByItem[0]?.name ?? 'No data'} leads sales</small>
                          </li>

                          <li className="list-group-item">
                            <div className="fw-semibold">Highest Margin Signal</div>
                            <small className="text-muted">
                              {dashboard?.profit.margin ? `${(dashboard.profit.margin * 100).toFixed(1)}%` : '0%'} margin
                            </small>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 7 */}
                <div className="row g-4 mb-3">
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Top Items Table</h6>

                        <div className="table-responsive">
                          <table className="table table-sm table-striped align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>SKU</th>
                                <th className="text-end">Qty</th>
                                <th className="text-end">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboard?.topItems.map((item) => (
                                <tr key={item.itemId}>
                                  <td>{item.name}</td>
                                  <td>{item.sku}</td>
                                  <td className="text-end">{item.quantity}</td>
                                  <td className="text-end">{formatCurrency(item.value)}</td>
                                </tr>
                              ))}

                              {!dashboard?.topItems.length && (
                                <tr>
                                  <td colSpan={4}>No items yet.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Category Summary</h6>

                        <div className="table-responsive">
                          <table className="table table-sm table-striped align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Category</th>
                                <th className="text-end">Qty</th>
                                <th className="text-end">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboard?.categorySummary.map((row) => (
                                <tr key={row.category}>
                                  <td>{row.category}</td>
                                  <td className="text-end">{row.quantity}</td>
                                  <td className="text-end">{formatCurrency(row.value)}</td>
                                </tr>
                              ))}

                              {!dashboard?.categorySummary.length && (
                                <tr>
                                  <td colSpan={3}>No categories yet.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : isSeller ? (
            <div className="container my-3">
              <div className="row g-3">
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Total POs</h6>
                      <strong>{purchaseOrdersPage.total}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Requested</h6>
                      <strong>{purchaseOrders.filter((o) => o.status === 'requested').length}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Approved</h6>
                      <strong>{purchaseOrders.filter((o) => o.status === 'approved').length}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Received</h6>
                      <strong>{purchaseOrders.filter((o) => o.status === 'received').length}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4 mt-1">
                <div className="col-12">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Recent Purchase Orders</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped align-middle mb-0">
                          <thead>
                            <tr>
                              <th>PO ID</th>
                              <th>Status</th>
                              <th>Items</th>
                              <th className="text-end">Expected</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchaseOrders.slice(0, 6).map((order) => (
                              <tr key={order._id}>
                                <td>{order._id.slice(-6)}</td>
                                <td>{order.status}</td>
                                <td>{order.items?.length ?? 0}</td>
                                <td className="text-end">{order.expectedDate ?? '-'}</td>
                              </tr>
                            ))}
                            {!purchaseOrders.length ? (
                              <tr>
                                <td colSpan={4}>No purchase orders yet.</td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4 mt-1">
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Purchase Order Status</h6>
                      <div style={{ height: 260 }}>
                        <canvas ref={sellerStatusChartRef} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Monthly Orders</h6>
                      <div style={{ height: 260 }}>
                        <canvas ref={sellerMonthlyChartRef} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="container my-3">
              <div className="row g-3">
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Total SOs</h6>
                      <strong>{salesOrdersPage.total}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Requested</h6>
                      <strong>{salesOrders.filter((o) => o.status === 'requested').length}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Approved</h6>
                      <strong>{salesOrders.filter((o) => o.status === 'approved').length}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">Received</h6>
                      <strong>{salesOrders.filter((o) => o.status === 'received').length}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4 mt-1">
                <div className="col-12">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Recent Sales Orders</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped align-middle mb-0">
                          <thead>
                            <tr>
                              <th>SO ID</th>
                              <th>Status</th>
                              <th>Items</th>
                              <th className="text-end">Delivery</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesOrders.slice(0, 6).map((order) => (
                              <tr key={order._id}>
                                <td>{order._id.slice(-6)}</td>
                                <td>{order.status}</td>
                                <td>{order.items?.length ?? 0}</td>
                                <td className="text-end">{order.deliveryDate ?? '-'}</td>
                              </tr>
                            ))}
                            {!salesOrders.length ? (
                              <tr>
                                <td colSpan={4}>No sales orders yet.</td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4 mt-1">
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Sales Order Status</h6>
                      <div style={{ height: 260 }}>
                        <canvas ref={buyerStatusChartRef} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title mb-3">Monthly Orders</h6>
                      <div style={{ height: 260 }}>
                        <canvas ref={buyerMonthlyChartRef} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        ) : null}

        {showInventory && activeSection === 'inventory' ? (
        <section id="inventory" className="section">
          <div className="section-title">
            <h2>Inventory</h2>
            <span className="muted">Core stock catalog</span>
          </div>
          {isAdmin ? (
            <div className="d-flex flex-wrap gap-2 mb-3">
              <button className="btn btn-outline-primary" onClick={handleExport}>
                Export CSV
              </button>
              <label className="btn btn-outline-secondary mb-0">
                Import CSV
                <input type="file" accept=".csv" hidden onChange={handleImport} />
              </label>
            </div>
          ) : null}
          <div className="row g-4">
            {isAdmin ? (
              <div className="col-12 col-lg-4">
                <InventoryForm
                  initial={editing}
                  onSubmit={editing ? handleUpdate : handleCreate}
                  onCancel={() => setEditing(null)}
                  busy={busy}
                />
              </div>
            ) : null}
            <div className="col-12 col-lg-8">
              {loading ? (
                <div className="card loading">Loading inventory...</div>
              ) : (
                <InventoryTable
                  items={items}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  pagination={itemsPage}
                  onPageChange={handleItemsPageChange}
                  readOnly={!isAdmin}
                />
              )}
            </div>
          </div>
        </section>
        ) : null}

        {showAdjustments && activeSection === 'adjustments' ? (
        <section id="adjustments" className="section">
          <div className="section-title">
            <h2>Adjustments</h2>
            <span className="muted">Track stock movement</span>
          </div>
          <div className="row g-4">
            {isAdmin ? (
              <div className="col-12 col-lg-4">
              <StockAdjustment items={items} locations={locations} onAdjust={handleAdjust} busy={busy} />
            </div>
            ) : null}
            <div className="col-12 col-lg-8">
              <RecentTransactions
                transactions={transactions}
                pagination={transactionsPage}
                onPageChange={handleTransactionsPageChange}
              />
            </div>
          </div>
        </section>
        ) : null}

        {showStockLocations && activeSection === 'stock-locations' ? (
          <section id="stock-locations" className="section">
            <div className="section-title">
              <h2>Location Stock</h2>
              <span className="muted">Quantities by location</span>
            </div>
            <LocationStockTable
              stocks={stocks}
              pagination={stocksPage}
              onPageChange={handleStocksPageChange}
            />
          </section>
        ) : null}

        {showAuditLogs && activeSection === 'audit-logs' ? (
          <section id="audit-logs" className="section">
            <div className="section-title">
              <h2>Audit Logs</h2>
              <span className="muted">System activity</span>
            </div>
            <AuditLogTable
              logs={auditLogs}
              pagination={auditPage}
              onPageChange={handleAuditPageChange}
            />
          </section>
        ) : null}

        {isAdmin && activeSection === 'user-onboarding' ? (
          <section id="user-onboarding" className="section">
            <div className="section-title">
              <h2>User Onboarding</h2>
              <span className="muted">Approve or reject new users</span>
            </div>
            <UserOnboardingTable
              users={pendingUsers}
              onApprove={handleApproveUser}
              onReject={handleRejectUser}
              busy={busy}
            />
          </section>
        ) : null}

        {isAdmin && activeSection === 'company-settings' ? (
          <section id="company-settings" className="section">
            <div className="section-title">
              <h2>Company Settings</h2>
              <span className="muted">Manage brand details shown on the home page</span>
            </div>
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="card h-100">
                  <div className="card-body">
                    <form onSubmit={handleCompanySave} className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Company Name</label>
                        <input
                          className="form-control"
                          value={companySettings?.name ?? ''}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...(prev ?? { name: '' }),
                              name: e.target.value
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="col-12 col-lg-6">
                        <label className="form-label">Logo URL</label>
                        <input
                          className="form-control"
                          value={companySettings?.logoUrl ?? ''}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...(prev ?? { name: '' }),
                              logoUrl: e.target.value
                            }))
                          }
                          placeholder="https://"
                        />
                      </div>
                      <div className="col-12 col-lg-6">
                        <label className="form-label">Website URL</label>
                        <input
                          className="form-control"
                          value={companySettings?.websiteUrl ?? ''}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...(prev ?? { name: '' }),
                              websiteUrl: e.target.value
                            }))
                          }
                          placeholder="https://"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Tagline</label>
                        <input
                          className="form-control"
                          value={companySettings?.tagline ?? ''}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...(prev ?? { name: '' }),
                              tagline: e.target.value
                            }))
                          }
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={companySettings?.description ?? ''}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...(prev ?? { name: '' }),
                              description: e.target.value
                            }))
                          }
                        />
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary" type="submit" disabled={busy}>
                          Save Company Details
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title mb-3">Preview</h6>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {companySettings?.logoUrl ? (
                        <img
                          src={companySettings.logoUrl}
                          alt="Company logo"
                          style={{ width: 56, height: 56, borderRadius: 12 }}
                        />
                      ) : (
                        <div className="logo-mark">I</div>
                      )}
                      <div>
                        <strong>{companySettings?.name ?? 'Company Name'}</strong>
                        <div className="text-muted small">{companySettings?.tagline ?? ''}</div>
                      </div>
                    </div>
                    {companySettings?.websiteUrl ? (
                      <a href={companySettings.websiteUrl} target="_blank" rel="noreferrer">
                        {companySettings.websiteUrl}
                      </a>
                    ) : (
                      <span className="text-muted">Website URL not set</span>
                    )}
                    <p className="text-muted small mt-3 mb-0">
                      {companySettings?.description ?? 'Add a short company description.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {!isAdmin && activeSection === 'profile' ? (
          <section id="profile" className="section">
            <div className="section-title">
              <h2>Profile</h2>
              <span className="muted">Manage your account details</span>
            </div>
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="card h-100">
                  <div className="card-body">
                    <form onSubmit={handleProfileSave} className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Full Name</label>
                        <input
                          className="form-control"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="col-12 col-lg-6">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={profileForm.email} disabled />
                      </div>
                      <div className="col-12 col-lg-6">
                        <label className="form-label">Phone</label>
                        <input
                          className="form-control"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Address</label>
                        <input
                          className="form-control"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-12 col-lg-6">
                        <label className="form-label">Company Name</label>
                        <input
                          className="form-control"
                          value={profileForm.companyName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, companyName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-12 col-lg-6">
                        <label className="form-label">GST Number</label>
                        <input
                          className="form-control"
                          value={profileForm.gstNumber}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, gstNumber: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary" type="submit" disabled={busy}>
                          Save Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title mb-3">Profile Summary</h6>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="avatar">{(profileForm.name || 'U').slice(0, 2).toUpperCase()}</div>
                      <div>
                        <strong>{profileForm.name || 'User'}</strong>
                        <div className="text-muted small">{user?.role ?? 'User'}</div>
                      </div>
                    </div>
                    <div className="text-muted small">Email: {profileForm.email || '-'}</div>
                    <div className="text-muted small">Phone: {profileForm.phone || '-'}</div>
                    <div className="text-muted small">Company: {profileForm.companyName || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {showSuppliers && activeSection === 'suppliers' ? (
          <section id="suppliers" className="section">
            <SuppliersSection
              suppliers={suppliers}
              onCreate={handleSupplierCreate}
              onUpdate={handleSupplierUpdate}
              onDelete={handleSupplierDelete}
              pagination={suppliersPage}
              onPageChange={handleSuppliersPageChange}
              readOnly={!isAdmin}
              busy={busy}
            />
          </section>
        ) : null}

        {showCustomers && activeSection === 'customers' ? (
          <section id="customers" className="section">
            <CustomersSection
              customers={customers}
              onCreate={handleCustomerCreate}
              onUpdate={handleCustomerUpdate}
              onDelete={handleCustomerDelete}
              pagination={customersPage}
              onPageChange={handleCustomersPageChange}
              readOnly={!isAdmin}
              busy={busy}
            />
          </section>
        ) : null}

        {showLocations && activeSection === 'locations' ? (
          <section id="locations" className="section">
            <LocationsSection
              locations={locations}
              onCreate={handleLocationCreate}
              onUpdate={handleLocationUpdate}
              onDelete={handleLocationDelete}
              pagination={locationsPage}
              onPageChange={handleLocationsPageChange}
              readOnly={!isAdmin}
              busy={busy}
            />
          </section>
        ) : null}

        {showPurchaseOrders && activeSection === 'purchase-orders' ? (
          <section id="purchase-orders" className="section">
          <PurchaseOrdersSection
            suppliers={suppliers}
            items={items}
            orders={purchaseOrders}
            onCreate={handlePurchaseCreate}
            onDelete={handlePurchaseDelete}
            onUpdateStatus={handlePurchaseUpdate}
            onSupplierRespond={handlePurchaseSupplierRespond}
            onViewPdf={handlePurchasePdfView}
            onDownloadPdf={handlePurchasePdfDownload}
            pagination={purchaseOrdersPage}
            onPageChange={handlePurchaseOrdersPageChange}
              canViewPdf={isAdmin || isSeller}
            readOnly={!isAdmin}
            role={role}
            busy={busy}
          />
        </section>
        ) : null}

        {showSalesOrders && activeSection === 'sales-orders' ? (
          <section id="sales-orders" className="section">
          <SalesOrdersSection
            customers={customers}
            items={items}
            orders={salesOrders}
            onCreate={handleSalesCreate}
            onDelete={handleSalesDelete}
            onUpdateStatus={handleSalesUpdate}
            onViewPdf={handleSalesPdfView}
            onDownloadPdf={handleSalesPdfDownload}
            pagination={salesOrdersPage}
            onPageChange={handleSalesOrdersPageChange}
            canViewPdf={(order) => (isAdmin || isBuyer) && order.status !== 'requested'}
            readOnly={!isAdmin && !isBuyer}
            role={role}
            customerId={user?.customerId}
            busy={busy}
          />
        </section>
        ) : null}

        {showReturns && activeSection === 'returns' ? (
          <section id="returns" className="section">
            <ReturnsSection
              items={items}
              returns={returns}
              onCreate={handleReturnCreate}
              onDelete={handleReturnDelete}
              onUpdateStatus={handleReturnUpdate}
              pagination={returnsPage}
              onPageChange={handleReturnsPageChange}
              readOnly={!isAdmin}
              busy={busy}
            />
          </section>
        ) : null}
        </div>
      </div>
    </div>
  );
};
