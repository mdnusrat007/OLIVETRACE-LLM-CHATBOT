import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB() {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] MongoDB connected');
      return;
    } catch (err) {
      attempt++;
      console.error(`[DB] Connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        throw new Error('[DB] Could not connect to MongoDB after max retries');
      }
    }
  }
}
