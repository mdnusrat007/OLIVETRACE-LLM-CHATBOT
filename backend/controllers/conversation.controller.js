import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, status, provider } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (provider) filter.provider = provider;

    const [conversations, total] = await Promise.all([
      Conversation.find(filter).sort({ lastActivityAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Conversation.countDocuments(filter),
    ]);

    res.json({ success: true, data: { conversations, pagination: { page: Number(page), limit: Number(limit), total } } });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const conv = await Conversation.findOne({ sessionId: req.params.id });
    if (!conv) return res.status(404).json({ success: false, error: 'Not found' });
    const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
    res.json({ success: true, data: { conversation: conv, messages } });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { title, tags, status } = req.body;
    const conv = await Conversation.findByIdAndUpdate(
      req.params.id, { $set: { title, tags, status } }, { new: true }
    );
    if (!conv) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: conv });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await Conversation.findByIdAndUpdate(req.params.id, { $set: { status: 'cancelled' } });
    res.json({ success: true });
  } catch (err) { next(err); }
}
