import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'student' | 'faculty' | 'coordinator' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  googleId?: string;
  authProvider?: 'local' | 'google';
  role: UserRole;
  department: string;
  avatarUrl?: string;
  isVerified: boolean;
  studentDetails?: {
    rollNumber: string;
    phone?: string;
    semester: number;
    cgpa: number;
    skills: string[];
    bio?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    resumeUrl?: string;
  };
  facultyDetails?: {
    designation: string;
    officeHours?: string;
  };
  resetPasswordOtp?: string;
  resetPasswordExpires?: Date;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    role: {
      type: String,
      enum: ['student', 'faculty', 'coordinator', 'admin'],
      default: 'student',
      required: true,
      index: true,
    },
    department: { type: String, required: true, default: 'Computer Science' },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: true }, // Simplified email verification for hackathon demo
    studentDetails: {
      rollNumber: { type: String, sparse: true },
      phone: { type: String, default: '' },
      semester: { type: Number, default: 1 },
      cgpa: { type: Number, default: 0.0 },
      skills: [{ type: String }],
      bio: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
      resumeUrl: { type: String, default: '' },
    },
    facultyDetails: {
      designation: { type: String, default: 'Assistant Professor' },
      officeHours: { type: String, default: '10:00 AM - 12:00 PM' },
    },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);