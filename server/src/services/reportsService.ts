import { Customer } from '../models/Customer';
import { InventoryStock } from '../models/InventoryStock';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { SalesOrder } from '../models/SalesOrder';
import { Supplier } from '../models/Supplier';
import { User } from '../models/User';
import * as inventoryRepo from '../repositories/inventoryRepository';

const mapStatusCounts = (rows: Array<{ _id: string; count: number }>) =>
  rows.reduce<Record<string, number>>((acc, row) => {
    if (row?._id) {
      acc[row._id] = row.count;
    }
    return acc;
  }, {});

const aggregateMonthlyTotals = async (collection: 'purchase' | 'sales') => {
  const model = collection === 'purchase' ? PurchaseOrder : SalesOrder;
  const priceField = collection === 'purchase' ? '$items.cost' : '$items.price';

  const rows = await model.aggregate([
    { $unwind: '$items' },
    {
      $project: {
        month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        lineSubtotal: { $multiply: ['$items.quantity', priceField] },
        taxRate: { $ifNull: ['$taxRate', 0] }
      }
    },
    {
      $group: {
        _id: '$month',
        subtotal: { $sum: '$lineSubtotal' },
        gst: { $sum: { $multiply: ['$lineSubtotal', '$taxRate'] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return rows.map((row) => ({
    month: row._id as string,
    subtotal: row.subtotal ?? 0,
    gst: row.gst ?? 0,
    total: (row.subtotal ?? 0) + (row.gst ?? 0)
  }));
};

const aggregateSalesByCustomer = async () => {
  const rows = await SalesOrder.aggregate([
    { $unwind: '$items' },
    {
      $project: {
        customer: '$customer',
        lineSubtotal: { $multiply: ['$items.quantity', '$items.price'] }
      }
    },
    {
      $group: {
        _id: '$customer',
        subtotal: { $sum: '$lineSubtotal' }
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        customerId: '$_id',
        customerName: '$customer.name',
        subtotal: 1
      }
    },
    { $sort: { subtotal: -1 } },
    { $limit: 10 }
  ]);

  return rows.map((row) => ({
    customerId: String(row.customerId),
    customerName: row.customerName ?? 'Unknown',
    subtotal: row.subtotal ?? 0
  }));
};

const aggregateSalesByItem = async () => {
  const rows = await SalesOrder.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.item',
        quantity: { $sum: '$items.quantity' },
        subtotal: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
      }
    },
    {
      $lookup: {
        from: 'inventoryitems',
        localField: '_id',
        foreignField: '_id',
        as: 'item'
      }
    },
    { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        itemId: '$_id',
        name: '$item.name',
        sku: '$item.sku',
        quantity: 1,
        subtotal: 1
      }
    },
    { $sort: { subtotal: -1 } },
    { $limit: 10 }
  ]);

  return rows.map((row) => ({
    itemId: String(row.itemId),
    name: row.name ?? 'Unknown',
    sku: row.sku ?? '-',
    quantity: row.quantity ?? 0,
    subtotal: row.subtotal ?? 0
  }));
};

const aggregateOrderTotals = async (collection: 'purchase' | 'sales') => {
  const model = collection === 'purchase' ? PurchaseOrder : SalesOrder;
  const priceField = collection === 'purchase' ? '$items.cost' : '$items.price';

  const result = await model.aggregate([
    { $unwind: '$items' },
    {
      $project: {
        quantity: '$items.quantity',
        lineSubtotal: { $multiply: ['$items.quantity', priceField] },
        taxRate: { $ifNull: ['$taxRate', 0] }
      }
    },
    {
      $group: {
        _id: null,
        totalQty: { $sum: '$quantity' },
        subtotal: { $sum: '$lineSubtotal' },
        gst: { $sum: { $multiply: ['$lineSubtotal', '$taxRate'] } }
      }
    }
  ]);

  const totals = result[0] ?? { totalQty: 0, subtotal: 0, gst: 0 };
  return {
    totalQty: totals.totalQty ?? 0,
    subtotal: totals.subtotal ?? 0,
    gst: totals.gst ?? 0,
    total: (totals.subtotal ?? 0) + (totals.gst ?? 0)
  };
};

export const getAdminDashboard = async () => {
  const [
    inventorySummary,
    inventoryValuation,
    supplierCount,
    customerCount,
    userStatusRows,
    purchaseStatusRows,
    salesStatusRows,
    purchaseCount,
    salesCount,
    purchaseTotals,
    salesTotals,
    locationStockRows,
    purchaseMonthly,
    salesMonthly,
    categorySummaryRows,
    topItemsRows,
    salesByCustomerRows,
    salesByItemRows
  ] = await Promise.all([
    inventoryRepo.aggregateSummary().then((rows) => rows[0] ?? { totalItems: 0, totalQuantity: 0, lowStockCount: 0 }),
    inventoryRepo.aggregateValuation().then((rows) => rows[0] ?? { totalValue: 0, totalCost: 0 }),
    Supplier.countDocuments(),
    Customer.countDocuments(),
    User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    PurchaseOrder.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    SalesOrder.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    PurchaseOrder.countDocuments(),
    SalesOrder.countDocuments(),
    aggregateOrderTotals('purchase'),
    aggregateOrderTotals('sales'),
    InventoryStock.aggregate([
      { $group: { _id: '$location', totalQuantity: { $sum: '$quantity' } } },
      {
        $lookup: {
          from: 'locations',
          localField: '_id',
          foreignField: '_id',
          as: 'location'
        }
      },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          locationId: '$_id',
          locationName: '$location.name',
          totalQuantity: 1
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]),
    aggregateMonthlyTotals('purchase'),
    aggregateMonthlyTotals('sales'),
    inventoryRepo.aggregateCategorySummary(),
    inventoryRepo.aggregateTopItems(),
    aggregateSalesByCustomer(),
    aggregateSalesByItem()
  ]);

  const userStatusCounts = mapStatusCounts(userStatusRows);
  const purchaseStatusCounts = mapStatusCounts(purchaseStatusRows);
  const salesStatusCounts = mapStatusCounts(salesStatusRows);

  const netProfit = salesTotals.subtotal - purchaseTotals.subtotal;
  const margin = salesTotals.subtotal ? netProfit / salesTotals.subtotal : 0;

  const monthSet = new Set<string>([
    ...purchaseMonthly.map((row) => row.month),
    ...salesMonthly.map((row) => row.month)
  ]);
  const months = Array.from(monthSet).sort();
  const purchaseMap = new Map(purchaseMonthly.map((row) => [row.month, row]));
  const salesMap = new Map(salesMonthly.map((row) => [row.month, row]));
  const monthly = months.map((month) => ({
    month,
    purchaseTotal: purchaseMap.get(month)?.total ?? 0,
    salesTotal: salesMap.get(month)?.total ?? 0,
    purchaseSubtotal: purchaseMap.get(month)?.subtotal ?? 0,
    salesSubtotal: salesMap.get(month)?.subtotal ?? 0
  }));

  return {
    users: {
      total: Object.values(userStatusCounts).reduce((sum, value) => sum + value, 0),
      pending: userStatusCounts.pending ?? 0,
      approved: userStatusCounts.approved ?? 0,
      rejected: userStatusCounts.rejected ?? 0
    },
    suppliers: { count: supplierCount },
    customers: { count: customerCount },
    inventory: {
      summary: inventorySummary,
      valuation: inventoryValuation
    },
    locations: locationStockRows.map((row) => ({
      locationId: String(row.locationId),
      locationName: row.locationName ?? 'Unknown',
      totalQuantity: row.totalQuantity ?? 0
    })),
    purchaseOrders: {
      count: purchaseCount,
      statusCounts: purchaseStatusCounts,
      ...purchaseTotals
    },
    salesOrders: {
      count: salesCount,
      statusCounts: salesStatusCounts,
      ...salesTotals
    },
    profit: {
      net: netProfit,
      margin
    },
    monthly,
    categorySummary: categorySummaryRows.map((row) => ({
      category: row._id as string,
      quantity: row.quantity ?? 0,
      value: row.value ?? 0
    })),
    topItems: topItemsRows.map((row) => ({
      itemId: String(row._id),
      name: row.name as string,
      sku: row.sku as string,
      quantity: row.quantity ?? 0,
      value: row.value ?? 0
    })),
    salesByCustomer: salesByCustomerRows,
    salesByItem: salesByItemRows
  };
};
