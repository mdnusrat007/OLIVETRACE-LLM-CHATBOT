import EventBus from './event-bus.js';
import InferenceLog from '../models/InferenceLog.js';
import Conversation from '../models/Conversation.js';
import { inferenceLogSchema } from '../middleware/validate.js';

class IngestionService {
  constructor() {
    EventBus.on('inference.logged', this.handleInferenceEvent.bind(this));
  }

  async handleInferenceEvent(payload) {
    try {
      const { error, value } = inferenceLogSchema.validate(payload);
      if (error) {
        console.error('[IngestionService] Validation failed:', error.message);
        return;
      }
      const log = await InferenceLog.create(value);
      if (value.conversationId) {
        await Conversation.findByIdAndUpdate(value.conversationId, {
          $inc: { totalTokens: value.totalTokens, totalCostUsd: value.estimatedCostUsd },
          $set: { lastActivityAt: new Date() },
        });
      }
      console.log(`[IngestionService] Log saved: ${log._id} | ${value.latencyMs}ms | ${value.status}`);
    } catch (err) {
      console.error('[IngestionService] Error:', err.message);
    }
  }

  async ingestExternal(payload) {
    const { error, value } = inferenceLogSchema.validate(payload);
    if (error) throw new Error(`Invalid payload: ${error.message}`);
    const log = await InferenceLog.create(value);
    return log;
  }
}

export const ingestionService = new IngestionService();
