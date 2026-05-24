import mongoose from 'mongoose';

const InferenceLogSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    sessionId: { type: String, required: true },
    provider: { type: String, enum: ['anthropic', 'openai', 'ollama'], required: true },
    model: { type: String, required: true },
    modelVersion: String,
    requestTimestamp: { type: Date, required: true },
    responseTimestamp: { type: Date, required: true },
    latencyMs: { type: Number, required: true },
    timeToFirstTokenMs: Number,
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'error', 'timeout', 'cancelled'], required: true },
    httpStatusCode: Number,
    errorCode: String,
    errorMessage: String,
    inputPreview: { type: String, maxlength: 500 },
    outputPreview: { type: String, maxlength: 500 },
    temperature: Number,
    maxTokens: Number,
    streaming: { type: Boolean, default: false },
    sdkVersion: { type: String, default: '1.0.0' },
    environment: { type: String, default: 'development' },
  },
  { timestamps: true }
);

InferenceLogSchema.index({ sessionId: 1 });
InferenceLogSchema.index({ provider: 1 });
InferenceLogSchema.index({ status: 1 });
InferenceLogSchema.index({ requestTimestamp: -1 });
InferenceLogSchema.index({ latencyMs: 1 });
// TTL — 90 days in dev, remove or extend for prod
InferenceLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: process.env.NODE_ENV === 'production' ? 60 * 60 * 24 * 365 : 60 * 60 * 24 * 90 }
);

export default mongoose.model('InferenceLog', InferenceLogSchema);
