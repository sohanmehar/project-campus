import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicCalendarItem extends Document {
  title: string;
  category: 'holiday' | 'exam' | 'event' | 'deadline';
  startDate: Date;
  endDate?: Date;
  description?: string;
  department?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicCalendarSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['holiday', 'exam', 'event', 'deadline'],
      default: 'event',
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    description: { type: String, default: '' },
    department: { type: String, default: 'All Departments' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IAcademicCalendarItem>('AcademicCalendar', AcademicCalendarSchema);
