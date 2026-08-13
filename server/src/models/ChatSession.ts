import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
});

const ChatSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
    messages: [ChatMessageSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);