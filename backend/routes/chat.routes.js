import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as chatController from '../controllers/chat.controller.js';
import { createLLMClient } from '../services/llm/index.js';

const router = Router();

// POST /api/chat — non-streaming
router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId = uuidv4(), provider = 'ollama', model, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message is required' });

    const conv = await chatController.getOrCreateConversation(sessionId, provider, model);
    const userMsg = await chatController.saveUserMessage(conv._id, sessionId, message);
    const assistantMsg = await chatController.createAssistantMessage(conv._id, sessionId);

    const llm = createLLMClient(provider, model);
    const messages = [...history, { role: 'user', content: message }];
    const t0 = Date.now();
    const response = await llm.call({
      messages, sessionId, conversationId: conv._id.toString(), messageId: assistantMsg._id.toString(),
    });
    await chatController.finalizeAssistantMessage(assistantMsg._id, response.content, Date.now() - t0);

    res.json({
      success: true,
      data: {
        messageId: assistantMsg._id,
        conversationId: conv._id,
        content: response.content,
        role: 'assistant',
        tokenUsage: response.usage,
        latencyMs: Date.now() - t0,
        provider,
        model: model || 'default',
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/stream — SSE
router.get('/stream', async (req, res) => {
  const { message, sessionId = uuidv4(), provider = 'ollama', model } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering on Render
  res.flushHeaders();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const t0 = Date.now();
  try {
    const conv = await chatController.getOrCreateConversation(sessionId, provider, model);
    const history = await chatController.getHistory(conv._id);
    await chatController.saveUserMessage(conv._id, sessionId, message);
    const assistantMsg = await chatController.createAssistantMessage(conv._id, sessionId);

    send('start', { messageId: assistantMsg._id, conversationId: conv._id });

    const llm = createLLMClient(provider, model);
    let fullContent = '';

    for await (const token of llm.stream({
      messages: [...history, { role: 'user', content: message }],
      sessionId,
      conversationId: conv._id.toString(),
      messageId: assistantMsg._id.toString(),
    })) {
      fullContent += token;
      send('token', { token });
    }

    await chatController.finalizeAssistantMessage(assistantMsg._id, fullContent, Date.now() - t0);
    send('done', { fullContent, latencyMs: Date.now() - t0 });
  } catch (err) {
    send('error', { code: err.code || 'ERROR', message: err.message });
  } finally {
    res.end();
  }
});

export default router;
