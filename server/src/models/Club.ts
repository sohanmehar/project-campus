import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  name: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Social' | 'Academic';
  description: string;
  leadName: string;
  leadEmail?: string;
  meetingSchedule: string;
  roomLocation: string;
  memberCount: number;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Social', 'Academic'],
      default: 'Technical',
    },
    description: { type: String, required: true },
    leadName: { type: String, default: 'Campus Coordinator' },
    leadEmail: { type: String, default: 'coordinator@campusgpt.edu' },
    meetingSchedule: { type: String, default: 'Every Wednesday at 4:30 PM' },
    roomLocation: { type: String, default: 'Student Activity Center Lab 2' },
    memberCount: { type: Number, default: 0 },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model<IClub>('Club', ClubSchema);
