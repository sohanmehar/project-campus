import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord {
  studentId: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'late';
}

export interface IAttendanceSession extends Document {
  courseId?: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  facultyName: string;
  subject: string;
  department: string;
  slot: string;
  date: Date;
  records: IAttendanceRecord[];
}

const AttendanceRecordSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
});

const AttendanceSessionSchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: false }, // Made optional
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    facultyName: { type: String, required: true },
    subject: { type: String, required: true },
    department: { type: String, required: true, default: 'Computer Science' },
    slot: { type: String, required: true },
    date: { type: Date, default: Date.now },
    records: [AttendanceRecordSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);