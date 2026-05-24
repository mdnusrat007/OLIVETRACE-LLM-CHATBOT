import { Router } from 'express';
import { ingestLog } from '../controllers/ingest.controller.js';

const router = Router();
router.post('/log', ingestLog);

export default router;
