import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  bannerUrl?: string;
  venue: string;
  organizer?: string;
  registrationUrl?: string;
  date: Date;
  registrationDeadline?: Date;
  capacity?: number;
  category: string;
  coordinatorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    bannerUrl: { type: String, default: '' },
    venue: { type: String, required: true, default: 'Main Auditorium' },
    organizer: { type: String, default: 'Campus Event Committee' },
    registrationUrl: { type: String, default: '' },
    date: { type: Date, required: true, index: true },
    registrationDeadline: { type: Date },
    capacity: { type: Number, default: 150 },
    category: {
      type: String,
      default: 'Technical',
    },
    coordinatorId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);