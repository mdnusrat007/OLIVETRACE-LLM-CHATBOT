import { OLLAMA_URL } from '../../../config/env.js';

export default class OllamaProvider {
  constructor(model = 'llama3') {
    this.model = model;
  }

  async *stream({ messages }) {
    const lastMessage =
      messages[messages.length - 1]?.content || '';

    const response = await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: lastMessage,
          stream: true,
        }),
      }
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } =
        await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      const lines = chunk
        .split('\\n')
        .filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);

          if (json.response) {
            yield {
              text: json.response,
            };
          }
        } catch {}
      }
    }
  }
}
