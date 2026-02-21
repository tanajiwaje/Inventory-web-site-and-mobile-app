import mongoose, { Document, Schema, Types } from 'mongoose';

export interface InventoryStockDocument extends Document {
  item: Types.ObjectId;
  location: Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryStockSchema = new Schema<InventoryStockDocument>(
  {
    item: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    quantity: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

inventoryStockSchema.index({ item: 1, location: 1 }, { unique: true });

export const InventoryStock = mongoose.model<InventoryStockDocument>(
  'InventoryStock',
  inventoryStockSchema
);
