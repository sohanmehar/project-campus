import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  ticketId: string;
  studentId: mongoose.Types.ObjectId;
  category: 'Academic' | 'Hostel' | 'IT & Wi-Fi' | 'Finance' | 'Other';
  description: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved';
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['Academic', 'Hostel', 'IT & Wi-Fi', 'Finance', 'Other'],
      required: true,
    },
    description: { type: String, required: true },
    location: { type: String, default: 'Campus Block C' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: {
      type: String,
      enum: ['Submitted', 'Assigned', 'In Progress', 'Resolved'],
      default: 'Submitted',
      index: true,
    },
    assignedTo: { type: String, default: 'IT Support Cell' },
    resolutionNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);