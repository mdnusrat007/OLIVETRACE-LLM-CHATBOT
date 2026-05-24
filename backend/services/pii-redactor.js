const PII_PATTERNS = [
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
  { pattern: /(\+1[-.\\s]?)?\(?\d{3}\)?[-.\\s]?\d{3}[-.\\s]?\d{4}/g, replacement: '[PHONE]' },
  { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[CARD]' },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN]' },
  { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP]' },
  { pattern: /\b(sk-|pk-|api_key=|token=)[A-Za-z0-9_-]{20,}\b/gi, replacement: '[API_KEY]' },
];

class PIIRedactor {
  redact(text) {
    if (!text || typeof text !== 'string') return text;
    let redacted = text;
    for (const { pattern, replacement } of PII_PATTERNS) {
      redacted = redacted.replace(pattern, replacement);
    }
    return redacted;
  }

  redactObject(obj) {
    if (typeof obj === 'string') return this.redact(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.redactObject(item));
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, this.redactObject(v)]));
    }
    return obj;
  }
}

export const piiRedactor = new PIIRedactor();
