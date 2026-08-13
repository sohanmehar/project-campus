import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientRole?: string; // 'all' | 'student' | 'faculty' | 'admin'
  recipientId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'assignment' | 'attendance' | 'placement' | 'event' | 'notice';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipientRole: { type: String, default: 'all' },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['assignment', 'attendance', 'placement', 'event', 'notice'], default: 'notice' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);