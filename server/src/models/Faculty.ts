import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty extends Document {
  name: string;
  email: string;
  department: string;
  designation: string;
  courses: string[];
  officeHours: string;
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, default: 'Computer Science' },
    designation: { type: String, required: true, default: 'Assistant Professor' },
    courses: [{ type: String }],
    officeHours: { type: String, default: 'Mon/Wed 10:00 AM - 12:00 PM' },
  },
  { timestamps: true }
);

export default mongoose.model<IFaculty>('Faculty', FacultySchema);