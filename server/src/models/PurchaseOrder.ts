import mongoose, { Schema, Document, Types } from 'mongoose';

export type PurchaseOrderStatus = 'requested' | 'supplier_submitted' | 'approved' | 'received';

export interface PurchaseOrderLine {
  item: Types.ObjectId;
  quantity: number;
  cost: number;
}

export interface PurchaseOrderDocument extends Document {
  supplier: Types.ObjectId;
  status: PurchaseOrderStatus;
  items: PurchaseOrderLine[];
  paymentTerms?: string;
  deliveryDate?: Date;
  taxRate?: number;
  shippingAddress?: string;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderSchema = new Schema<PurchaseOrderDocument>(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    status: {
      type: String,
      enum: ['requested', 'supplier_submitted', 'approved', 'received'],
      default: 'requested'
    },
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'InventoryItem',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        cost: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    expectedDate: Date,
    deliveryDate: Date,
    paymentTerms: {
      type: String,
      trim: true
    },
    taxRate: {
      type: Number,
      min: 0,
      default: 0.18
    },
    shippingAddress: {
      type: String,
      trim: true
    },
    receivedDate: Date,
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const PurchaseOrder = mongoose.model<PurchaseOrderDocument>('PurchaseOrder', purchaseOrderSchema);
