import { ingestionService } from '../services/ingestion.service.js';

export async function ingestLog(req, res, next) {
  try {
    const log = await ingestionService.ingestExternal(req.body);
    res.status(201).json({ success: true, logId: log._id });
  } catch (err) {
    next(err);
  }
}
