import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  bannerUrl: string;
  venue: string;
  date: Date;
  registrationDeadline: Date;
  capacity: number;
  category: 'Hackathon' | 'Workshop' | 'Cultural' | 'Academic' | 'Sports';
  coordinatorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    bannerUrl: { type: String, default: '' },
    venue: { type: String, required: true, default: 'Main Auditorium' },
    date: { type: Date, required: true, index: true },
    registrationDeadline: { type: Date, required: true },
    capacity: { type: Number, default: 150 },
    category: {
      type: String,
      enum: ['Hackathon', 'Workshop', 'Cultural', 'Academic', 'Sports'],
      default: 'Academic',
    },
    coordinatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);