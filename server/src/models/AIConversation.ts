import mongoose, { Schema, Document } from 'mongoose';

export type MessageSender = 'user' | 'ai' | 'assistant' | 'system';

export interface IMessage {
  sender: MessageSender | string;
  text: string;
  structuredData?: any;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
    structuredData: { type: Schema.Types.Mixed, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AIConversationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    userName: { type: String, default: 'Student User' },
    userRole: { type: String, default: 'student' },
    title: { type: String, default: 'New Conversation' },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);