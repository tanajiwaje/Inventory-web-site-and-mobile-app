import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'admin' | 'seller' | 'buyer' | 'super_admin';

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
  supplierId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'seller', 'buyer', 'super_admin'],
      default: 'buyer'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer'
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<UserDocument>('User', userSchema);
