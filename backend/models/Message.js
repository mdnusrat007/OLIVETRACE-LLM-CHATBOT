import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sessionId: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, default: '' },
    contentPreview: { type: String, maxlength: 200 },
    tokenCount: { type: Number, default: 0 },
    isStreamed: { type: Boolean, default: false },
    streamDurationMs: { type: Number },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ sessionId: 1 });

export default mongoose.model('Message', MessageSchema);
