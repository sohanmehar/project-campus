import mongoose, { Schema, Document } from 'mongoose';

export interface IEventRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName?: string;
  rollNumber?: string;
  eventTitle?: string;
  ticketPassId: string;
  qrCodeToken?: string;
  qrCodeData?: string;
  status: string;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema: Schema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, default: 'Student Attendee' },
    rollNumber: { type: String, default: 'CS-2024-042' },
    eventTitle: { type: String, default: 'Campus Event' },
    ticketPassId: { type: String, required: true },
    qrCodeToken: { type: String, default: '' },
    qrCodeData: { type: String, default: '' },
    status: { type: String, default: 'registered' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);