import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  courseName: string;
  courseCode: string;
  facultyId: mongoose.Types.ObjectId;
  deadline: Date;
  totalMarks: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    courseName: { type: String, required: true, default: 'Computer Science' },
    courseCode: { type: String, required: true, default: 'CS-401' },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true, index: true },
    totalMarks: { type: Number, default: 100 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);