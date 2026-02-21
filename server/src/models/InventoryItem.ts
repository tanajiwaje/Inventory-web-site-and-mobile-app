import mongoose, { Schema, Document } from 'mongoose';

export interface InventoryItemDocument extends Document {
  name: string;
  sku: string;
  quantity: number;
  cost: number;
  price: number;
  barcode?: string;
  category?: string;
  lowStockThreshold: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    barcode: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    lowStockThreshold: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const InventoryItem = mongoose.model<InventoryItemDocument>('InventoryItem', inventoryItemSchema);

