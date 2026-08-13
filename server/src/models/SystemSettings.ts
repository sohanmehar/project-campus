import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  attendanceThreshold: number;
  allowGuestAccess: boolean;
  emailAlerts: boolean;
  sessionLifespanDays: number;
  updatedAt: Date;
}

const SystemSettingsSchema: Schema = new Schema(
  {
    attendanceThreshold: { type: Number, default: 75 },
    allowGuestAccess: { type: Boolean, default: false },
    emailAlerts: { type: Boolean, default: true },
    sessionLifespanDays: { type: Number, default: 7 },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);