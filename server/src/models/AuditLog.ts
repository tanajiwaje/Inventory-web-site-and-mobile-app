import mongoose, { Document, Schema } from 'mongoose';

export interface AuditLogDocument extends Document {
  entity: string;
  entityId: string;
  action: string;
  message?: string;
  userId?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    message: { type: String },
    userId: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);
