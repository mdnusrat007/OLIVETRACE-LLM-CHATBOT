// Prices per token (USD)
const PRICING = {
  anthropic: {
    'claude-sonnet-4-20250514': { input: 0.000003, output: 0.000015 },
    'claude-opus-4-20250514':   { input: 0.000015, output: 0.000075 },
    'claude-haiku-4-5-20251001':{ input: 0.0000008, output: 0.000004 },
  },
  openai: {
    'gpt-4.1':      { input: 0.000002, output: 0.000008 },
    'gpt-4o':       { input: 0.0000025, output: 0.00001 },
    'gpt-3.5-turbo':{ input: 0.0000005, output: 0.0000015 },
  },
  ollama: {
    'llama3': { input: 0.00000035, output: 0.0000015 },
    'ollama-1.5-pro':   { input: 0.00000125, output: 0.000005 },
  },
};

export const costCalculator = {
  estimate(provider, model, usage) {
    if (!usage) return 0;
    const prices = PRICING[provider]?.[model];
    if (!prices) return 0;
    const inputCost = (usage.input_tokens || 0) * prices.input;
    const outputCost = (usage.output_tokens || 0) * prices.output;
    return parseFloat((inputCost + outputCost).toFixed(8));
  },
};
