import mongoose, { Schema, Document } from 'mongoose';

export interface LocationDocument extends Document {
  name: string;
  code?: string;
  address?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<LocationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Location = mongoose.model<LocationDocument>('Location', locationSchema);
