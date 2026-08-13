import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  placementId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'applied' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    placementId: { type: Schema.Types.ObjectId, ref: 'Placement', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected'],
      default: 'applied',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ApplicationSchema.index({ placementId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);