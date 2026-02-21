import mongoose, { Document, Schema } from 'mongoose';

export interface CompanySettingsDocument extends Document {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  tagline?: string;
  description?: string;
  updatedAt: Date;
}

const companySettingsSchema = new Schema<CompanySettingsDocument>(
  {
    name: { type: String, required: true },
    logoUrl: { type: String },
    websiteUrl: { type: String },
    tagline: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);

export const CompanySettings = mongoose.model<CompanySettingsDocument>(
  'CompanySettings',
  companySettingsSchema
);
