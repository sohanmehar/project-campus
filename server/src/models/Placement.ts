import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacement extends Document {
  companyName: string;
  logoUrl?: string;
  jobRole: string;
  ctc: number; // in LPA
  location: string;
  registrationUrl?: string;
  eligibility: {
    minCgpa: number;
    allowedDepartments: string[];
    requiredSkills: string[];
  };
  applicationDeadline: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementSchema: Schema = new Schema(
  {
    companyName: { type: String, required: true, trim: true, index: true },
    logoUrl: { type: String, default: '' },
    jobRole: { type: String, required: true, trim: true },
    ctc: { type: Number, required: true },
    location: { type: String, default: 'Bangalore / Remote' },
    registrationUrl: { type: String, default: '' },
    eligibility: {
      minCgpa: { type: Number, default: 7.5 },
      allowedDepartments: [{ type: String }],
      requiredSkills: [{ type: String }],
    },
    applicationDeadline: { type: Date, required: true, index: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlacement>('Placement', PlacementSchema);