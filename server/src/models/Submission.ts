import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  studentName?: string;
  rollNumber?: string;
  assignmentTitle?: string;
  fileUrl?: string;
  status: 'submitted' | 'graded';
  marksObtained?: number | null;
  totalMarks?: number;
  feedback?: string;
  isReopened?: boolean;
  reopenedUntil?: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: false },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    studentName: { type: String, default: 'Alex Mercer' },
    rollNumber: { type: String, default: 'CS-2024-042' },
    assignmentTitle: { type: String, default: 'Course Assignment' },
    fileUrl: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
    marksObtained: { type: Number, default: null },
    totalMarks: { type: Number, default: 100 },
    feedback: { type: String, default: '' },
    isReopened: { type: Boolean, default: false },
    reopenedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);