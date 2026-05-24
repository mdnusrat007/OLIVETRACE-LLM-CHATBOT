import OllamaProvider from './providers/ollama.js';
import { LLMSDKWrapper } from './llm-sdk.js';

const PROVIDERS = {
  ollama: {
    cls: OllamaProvider,
    defaultModel: 'phi3',
  },
};

export function createLLMClient(
  providerName = 'ollama',
  model
) {
  const cfg = PROVIDERS[providerName];

  const resolvedModel =
    model || cfg.defaultModel;

  const provider = new cfg.cls(
    resolvedModel
  );

  return new LLMSDKWrapper(provider, {
    providerName,
    model: resolvedModel,
  });
}
