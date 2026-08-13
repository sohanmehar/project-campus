import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  name: string;
  department: string;
  facultyId: mongoose.Types.ObjectId;
  credits: number;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, default: 'Computer Science' },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    credits: { type: Number, default: 4 },
    semester: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', CourseSchema);