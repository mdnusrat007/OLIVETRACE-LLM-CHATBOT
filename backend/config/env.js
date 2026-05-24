import 'dotenv/config';

const REQUIRED = ['MONGO_URI'];

export const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export function validateEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
  console.log('[ENV] Environment validated');
}
