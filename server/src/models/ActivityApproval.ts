import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityApproval extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  rollNumber: string;
  department: string;
  requestType: string;
  targetName: string;
  status: 'pending' | 'approved' | 'declined';
  appliedAt: Date;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityApprovalSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String, default: 'CS-2024-042' },
    department: { type: String, default: 'Computer Science' },
    requestType: { type: String, required: true },
    targetName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IActivityApproval>('ActivityApproval', ActivityApprovalSchema);
