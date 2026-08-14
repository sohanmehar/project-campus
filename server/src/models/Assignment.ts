import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  courseName: string;
  courseCode: string;
  subject?: string;
  facultyId?: mongoose.Types.ObjectId;
  deadline: Date;
  totalMarks: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: 'Assignment problem statement and rubric.' },
    courseName: { type: String, required: true, default: 'Database Systems & SQL' },
    courseCode: { type: String, required: true, default: 'CS-401' },
    subject: { type: String, default: 'Database Systems & SQL' },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    deadline: { type: Date, required: true, index: true },
    totalMarks: { type: Number, default: 100 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);