import mongoose, { Schema, Document } from 'mongoose';

export interface SupplierDocument extends Document {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<SupplierDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    contactName: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Supplier = mongoose.model<SupplierDocument>('Supplier', supplierSchema);
