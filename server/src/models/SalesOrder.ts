import mongoose, { Schema, Document, Types } from 'mongoose';

export type SalesOrderStatus = 'requested' | 'approved' | 'received';

export interface SalesOrderLine {
  item: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface SalesOrderDocument extends Document {
  customer: Types.ObjectId;
  status: SalesOrderStatus;
  items: SalesOrderLine[];
  paymentTerms?: string;
  deliveryDate?: Date;
  approvedDate?: Date;
  receivedDate?: Date;
  taxRate?: number;
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const salesOrderSchema = new Schema<SalesOrderDocument>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'received'],
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
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    notes: {
      type: String,
      trim: true
    },
    deliveryDate: Date,
    approvedDate: Date,
    receivedDate: Date,
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
    }
  },
  {
    timestamps: true
  }
);

export const SalesOrder = mongoose.model<SalesOrderDocument>('SalesOrder', salesOrderSchema);
