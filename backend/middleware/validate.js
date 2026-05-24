import Joi from 'joi';

export const inferenceLogSchema = Joi.object({
  sessionId: Joi.string().required(),
  conversationId: Joi.string().required(),
  messageId: Joi.string().optional(),
  provider: Joi.string().valid('anthropic', 'openai', 'ollama').required(),
  model: Joi.string().required(),
  requestTimestamp: Joi.date().required(),
  responseTimestamp: Joi.date().required(),
  latencyMs: Joi.number().min(0).required(),
  timeToFirstTokenMs: Joi.number().min(0).optional().allow(null),
  inputTokens: Joi.number().min(0).default(0),
  outputTokens: Joi.number().min(0).default(0),
  totalTokens: Joi.number().min(0).default(0),
  estimatedCostUsd: Joi.number().min(0).default(0),
  status: Joi.string().valid('success', 'error', 'timeout', 'cancelled').required(),
  httpStatusCode: Joi.number().optional(),
  errorCode: Joi.string().allow(null, '').optional(),
  errorMessage: Joi.string().allow(null, '').optional(),
  inputPreview: Joi.string().max(500).optional().allow(''),
  outputPreview: Joi.string().max(500).optional().allow(''),
  temperature: Joi.number().min(0).max(2).optional(),
  maxTokens: Joi.number().optional(),
  streaming: Joi.boolean().default(false),
  sdkVersion: Joi.string().optional(),
  environment: Joi.string().default('development'),
});

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, error: error.details.map((d) => d.message).join(', ') });
    }
    req.validatedBody = value;
    next();
  };
}
