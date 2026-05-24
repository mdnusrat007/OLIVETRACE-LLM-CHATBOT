import EventBus from '../event-bus.js';
import { piiRedactor } from '../pii-redactor.js';
import { costCalculator } from '../../utils/cost-calculator.js';

export class LLMSDKWrapper {
  constructor(provider, options = {}) {
    this.provider = provider;
    this.providerName = options.providerName;
    this.model = options.model;
    this.sdkVersion = '1.0.0';
  }

  async call({ messages, sessionId, conversationId, messageId, temperature = 0.7, maxTokens = 1000 }) {
    const requestTimestamp = new Date();
    let status = 'success';
    let errorCode = null;
    let errorMessage = null;
    let response = null;

    try {
      response = await this.provider.complete({ messages, temperature, maxTokens });
      return response;
    } catch (err) {
      status = 'error';
      errorCode = err.code || 'UNKNOWN_ERROR';
      errorMessage = err.message;
      throw err;
    } finally {
      const responseTimestamp = new Date();
      const latencyMs = responseTimestamp - requestTimestamp;
      const inputPreview = piiRedactor.redact(messages.at(-1)?.content?.slice(0, 300));
      const outputPreview = response ? piiRedactor.redact(response.content?.slice(0, 300)) : '';

      EventBus.emit('inference.logged', {
        sessionId, conversationId, messageId,
        provider: this.providerName, model: this.model,
        requestTimestamp, responseTimestamp, latencyMs,
        inputTokens: response?.usage?.input_tokens ?? 0,
        outputTokens: response?.usage?.output_tokens ?? 0,
        totalTokens: (response?.usage?.input_tokens ?? 0) + (response?.usage?.output_tokens ?? 0),
        estimatedCostUsd: costCalculator.estimate(this.providerName, this.model, response?.usage),
        status, errorCode, errorMessage,
        httpStatusCode: status === 'success' ? 200 : 500,
        inputPreview, outputPreview,
        temperature, maxTokens, streaming: false,
        sdkVersion: this.sdkVersion,
        environment: process.env.NODE_ENV || 'development',
      });
    }
  }

  async *stream({ messages, sessionId, conversationId, messageId, temperature = 0.7, maxTokens = 1000 }) {
    const requestTimestamp = new Date();
    let firstTokenTime = null;
    let fullContent = '';
    let usage = { input_tokens: 0, output_tokens: 0 };
    let status = 'success';
    let errorCode = null;
    let errorMessage = null;

    try {
      for await (const token of this.provider.stream({ messages, temperature, maxTokens })) {
        if (!firstTokenTime) firstTokenTime = new Date();
        fullContent += token.text;
        usage = token.usage ?? usage;
        yield token.text;
      }
    } catch (err) {
      status = 'error';
      errorCode = err.code || 'STREAM_ERROR';
      errorMessage = err.message;
      throw err;
    } finally {
      const responseTimestamp = new Date();
      const latencyMs = responseTimestamp - requestTimestamp;
      const timeToFirstTokenMs = firstTokenTime ? firstTokenTime - requestTimestamp : null;

      EventBus.emit('inference.logged', {
        sessionId, conversationId, messageId,
        provider: this.providerName, model: this.model,
        requestTimestamp, responseTimestamp, latencyMs, timeToFirstTokenMs,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
        estimatedCostUsd: costCalculator.estimate(this.providerName, this.model, usage),
        status, errorCode, errorMessage,
        httpStatusCode: status === 'success' ? 200 : 500,
        inputPreview: piiRedactor.redact(messages.at(-1)?.content?.slice(0, 300)),
        outputPreview: piiRedactor.redact(fullContent.slice(0, 300)),
        temperature, maxTokens, streaming: true,
        sdkVersion: this.sdkVersion,
        environment: process.env.NODE_ENV || 'development',
      });
    }
  }
}
