import mongoose, { Schema, Document } from 'mongoose';

export interface IEventRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  registeredAt: Date;
  qrCodeToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema: Schema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    registeredAt: { type: Date, default: Date.now },
    qrCodeToken: { type: String, required: true },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);