import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  department: string;
  subject?: string;
  attachmentUrl?: string;
  postedBy: mongoose.Types.ObjectId; // Faculty User ID
  facultyName: string;
  noticeType: 'announcement' | 'study_material';
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    department: { type: String, required: true, default: 'Computer Science' },
    subject: { type: String, default: 'General' },
    attachmentUrl: { type: String, default: '' },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    facultyName: { type: String, required: true },
    noticeType: { type: String, enum: ['announcement', 'study_material'], default: 'announcement' },
  },
  { timestamps: true }
);

export default mongoose.model<INotice>('Notice', NoticeSchema);