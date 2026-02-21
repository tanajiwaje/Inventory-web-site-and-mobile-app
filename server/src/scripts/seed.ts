import mongoose from 'mongoose';

import { env } from '../config/env';
import { Customer } from '../models/Customer';
import { InventoryItem } from '../models/InventoryItem';
import { InventoryStock } from '../models/InventoryStock';
import { InventoryTransaction } from '../models/InventoryTransaction';
import { Location } from '../models/Location';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { Return as ReturnModel } from '../models/Return';
import { SalesOrder } from '../models/SalesOrder';
import { Supplier } from '../models/Supplier';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const COUNT = 100;
const LINES_PER_ORDER = 3;

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sku = (idx: number) => `SKU-${String(idx + 1).padStart(4, '0')}`;
const barcode = (idx: number) => `BC${String(100000 + idx)}`;

const categories = ['Grains', 'Pulses', 'Spices', 'Oils', 'Bakery', 'Beverages'];
const locations = ['North Depot', 'South Hub', 'Central Store', 'Dock A', 'Dock B'];

const makeSuppliers = () =>
  Array.from({ length: COUNT }, (_, i) => ({
    name: `Supplier ${i + 1}`,
    contactName: `Contact ${i + 1}`,
    phone: `90000${String(i).padStart(5, '0')}`,
    email: `supplier${i + 1}@example.com`,
    address: `Supplier Address ${i + 1}`
  }));

const makeCustomers = () =>
  Array.from({ length: COUNT }, (_, i) => ({
    name: `Customer ${i + 1}`,
    contactName: `Customer Contact ${i + 1}`,
    phone: `80000${String(i).padStart(5, '0')}`,
    email: `customer${i + 1}@example.com`,
    address: `Customer Address ${i + 1}`
  }));

const makeLocations = () =>
  Array.from({ length: COUNT }, (_, i) => ({
    name: locations[i % locations.length] + ` ${i + 1}`,
    code: `LOC-${String(i + 1).padStart(3, '0')}`,
    address: `Warehouse Address ${i + 1}`,
    isDefault: i === 0
  }));

const makeItems = () =>
  Array.from({ length: COUNT }, (_, i) => {
    const price = randomInt(50, 500);
    const cost = Math.max(10, price - randomInt(5, 40));
    return {
      name: `Item ${i + 1}`,
      sku: sku(i),
      barcode: barcode(i),
      category: categories[i % categories.length],
      quantity: randomInt(0, 500),
      cost,
      price,
      lowStockThreshold: randomInt(5, 30),
      description: `Sample item description ${i + 1}`
    };
  });

const createOrders = (items: mongoose.Types.ObjectId[], supplierIds: mongoose.Types.ObjectId[]) =>
  Array.from({ length: COUNT }, () => ({
    supplier: pick(supplierIds),
    status: pick(['requested', 'supplier_submitted', 'approved', 'received']),
    expectedDate: new Date(Date.now() + randomInt(1, 30) * 86400000),
    deliveryDate: new Date(Date.now() + randomInt(5, 40) * 86400000),
    paymentTerms: 'Net 15',
    taxRate: 0.18,
    shippingAddress: 'Warehouse, Industrial Area',
    notes: 'Auto-generated PO',
    items: Array.from({ length: LINES_PER_ORDER }, () => {
      const itemId = pick(items);
      return {
        item: itemId,
        quantity: randomInt(1, 50),
        cost: randomInt(50, 400)
      };
    })
  }));

const createSalesOrders = (items: mongoose.Types.ObjectId[], customerIds: mongoose.Types.ObjectId[]) =>
  Array.from({ length: COUNT }, () => ({
    customer: pick(customerIds),
    status: pick(['requested', 'approved', 'received']),
    deliveryDate: new Date(Date.now() + randomInt(3, 20) * 86400000),
    paymentTerms: 'Advance 50%',
    taxRate: 0.18,
    shippingAddress: 'Customer Dock',
    notes: 'Auto-generated SO',
    items: Array.from({ length: LINES_PER_ORDER }, () => {
      const itemId = pick(items);
      return {
        item: itemId,
        quantity: randomInt(1, 50),
        price: randomInt(80, 600)
      };
    })
  }));

const createReturns = (items: mongoose.Types.ObjectId[]) =>
  Array.from({ length: COUNT }, () => ({
    type: pick(['customer', 'supplier']),
    status: pick(['requested', 'received', 'closed']),
    notes: 'Auto-generated return',
    items: Array.from({ length: 2 }, () => ({
      item: pick(items),
      quantity: randomInt(1, 20),
      reason: 'Damaged'
    }))
  }));

const createTransactions = (items: mongoose.Types.ObjectId[]) =>
  Array.from({ length: COUNT }, () => ({
    item: pick(items),
    type: pick(['receive', 'issue', 'adjust']),
    quantityChange: randomInt(-50, 50),
    reason: 'Seed adjustment'
  }));

const run = async () => {
  await mongoose.connect(env.mongoUri);

  if (!mongoose.connection.db) {
    throw new Error('MongoDB connection not ready');
  }
  await mongoose.connection.db.dropDatabase();

  const suppliers = await Supplier.insertMany(makeSuppliers());
  const customers = await Customer.insertMany(makeCustomers());
  const locationsData = await Location.insertMany(makeLocations());
  const itemsData = await InventoryItem.insertMany(makeItems());

  const supplierIds = suppliers.map((s) => s._id);
  const customerIds = customers.map((c) => c._id);
  const itemIds = itemsData.map((i) => i._id);
  const defaultLocation = locationsData[0];

  await InventoryStock.insertMany(
    itemsData.map((item) => ({
      item: item._id,
      location: defaultLocation._id,
      quantity: item.quantity
    }))
  );

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await User.insertMany([
    {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      passwordHash: adminPasswordHash,
      role: 'super_admin',
      status: 'approved',
      companyName: 'Inventra Holdings',
      gstNumber: 'GSTSUPER1234'
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'approved',
      companyName: 'Inventra Co',
      gstNumber: 'GSTADMIN1234'
    },
    {
      name: 'Seller User',
      email: 'seller@example.com',
      passwordHash: adminPasswordHash,
      role: 'seller',
      status: 'approved',
      companyName: 'Supplier Co',
      gstNumber: 'GSTSELLER1234',
      supplierId: suppliers[0]._id
    },
    {
      name: 'Buyer User',
      email: 'buyer@example.com',
      passwordHash: adminPasswordHash,
      role: 'buyer',
      status: 'approved',
      companyName: 'Buyer Co',
      gstNumber: 'GSTBUYER1234',
      customerId: customers[0]._id
    }
  ]);

  await PurchaseOrder.insertMany(createOrders(itemIds, supplierIds));
  await SalesOrder.insertMany(createSalesOrders(itemIds, customerIds));
  await ReturnModel.insertMany(createReturns(itemIds));
  await InventoryTransaction.insertMany(createTransactions(itemIds));

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    suppliers: suppliers.length,
    customers: customers.length,
    locations: locationsData.length,
    items: itemsData.length
  });
  await mongoose.disconnect();
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', error);
  process.exit(1);
});
