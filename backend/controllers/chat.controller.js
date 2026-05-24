import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export async function getOrCreateConversation(sessionId, provider, model) {
  let conv = await Conversation.findOne({ sessionId });
  if (!conv) {
    conv = await Conversation.create({ sessionId, provider, model, status: 'active' });
  }
  return conv;
}

export async function getHistory(conversationId) {
  const msgs = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(50);
  return msgs.map((m) => ({ role: m.role, content: m.content }));
}

export async function saveUserMessage(conversationId, sessionId, content) {
  const msg = await Message.create({
    conversationId, sessionId, role: 'user', content,
    contentPreview: content.slice(0, 200),
  });
  await Conversation.findByIdAndUpdate(conversationId, {
    $inc: { messageCount: 1 },
    $set: { title: content.slice(0, 60) || 'New Conversation' },
  });
  return msg;
}

export async function createAssistantMessage(conversationId, sessionId) {
  return Message.create({ conversationId, sessionId, role: 'assistant', content: '', isStreamed: true });
}

export async function finalizeAssistantMessage(messageId, fullContent, streamDurationMs) {
  await Message.findByIdAndUpdate(messageId, {
    content: fullContent,
    contentPreview: fullContent.slice(0, 200),
    streamDurationMs,
  });
  const msg = await Message.findById(messageId);
  await Conversation.findByIdAndUpdate(msg.conversationId, { $inc: { messageCount: 1 } });
  return msg;
}
