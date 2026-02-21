import mongoose, { Schema, Document, Types } from 'mongoose';

export type InventoryTransactionType = 'receive' | 'issue' | 'adjust';

export interface InventoryTransactionDocument extends Document {
  item: Types.ObjectId;
  type: InventoryTransactionType;
  quantityChange: number;
  reason?: string;
  createdAt: Date;
}

const inventoryTransactionSchema = new Schema<InventoryTransactionDocument>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    type: {
      type: String,
      enum: ['receive', 'issue', 'adjust'],
      required: true
    },
    quantityChange: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const InventoryTransaction = mongoose.model<InventoryTransactionDocument>(
  'InventoryTransaction',
  inventoryTransactionSchema
);
