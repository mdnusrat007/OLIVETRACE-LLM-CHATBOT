import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    title: { type: String, default: 'New Conversation' },
    provider: { type: String, enum: ['anthropic', 'openai', 'ollama'], required: true },
    model: { type: String, required: true },
    status: { type: String, enum: ['active', 'cancelled', 'archived'], default: 'active' },
    messageCount: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    totalCostUsd: { type: Number, default: 0 },
    tags: [String],
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ConversationSchema.index({ status: 1 });
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ lastActivityAt: -1 });

export default mongoose.model('Conversation', ConversationSchema);
