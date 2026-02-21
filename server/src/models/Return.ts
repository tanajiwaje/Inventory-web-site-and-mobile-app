import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReturnType = 'customer' | 'supplier';
export type ReturnStatus = 'requested' | 'received' | 'closed';

export interface ReturnLine {
  item: Types.ObjectId;
  quantity: number;
  reason?: string;
}

export interface ReturnDocument extends Document {
  type: ReturnType;
  relatedOrderId?: Types.ObjectId;
  status: ReturnStatus;
  items: ReturnLine[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const returnSchema = new Schema<ReturnDocument>(
  {
    type: {
      type: String,
      enum: ['customer', 'supplier'],
      required: true
    },
    relatedOrderId: {
      type: Schema.Types.ObjectId
    },
    status: {
      type: String,
      enum: ['requested', 'received', 'closed'],
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
        reason: {
          type: String,
          trim: true
        }
      }
    ],
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Return = mongoose.model<ReturnDocument>('Return', returnSchema);
