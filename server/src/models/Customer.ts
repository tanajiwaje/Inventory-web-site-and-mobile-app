import mongoose, { Schema, Document } from 'mongoose';

export interface CustomerDocument extends Document {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<CustomerDocument>(
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

export const Customer = mongoose.model<CustomerDocument>('Customer', customerSchema);
