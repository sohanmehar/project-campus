import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  headName: string;
  totalStudents: number;
  activeCourses: {
    code: string;
    name: string;
    credits: number;
    sem: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    headName: { type: String, required: true, default: 'Prof. Alan Turing' },
    totalStudents: { type: Number, default: 480 },
    activeCourses: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        credits: { type: Number, default: 4 },
        sem: { type: Number, default: 4 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);