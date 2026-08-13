import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AIConversationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);