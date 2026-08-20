import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  type: 'holiday' | 'exam' | 'academic' | 'deadline' | 'event';
  isHoliday: boolean;
  department?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true, index: true },
    endDate: { type: Date, default: null },
    type: {
      type: String,
      enum: ['holiday', 'exam', 'academic', 'deadline', 'event'],
      default: 'academic',
      required: true,
    },
    isHoliday: { type: Boolean, default: false },
    department: { type: String, default: 'All Departments' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

export default mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
