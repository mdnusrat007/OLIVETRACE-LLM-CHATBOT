import { Router } from 'express';
import * as ctrl from '../controllers/metrics.controller.js';

const router = Router();

router.get('/summary', ctrl.getSummary);
router.get('/latency', ctrl.getLatency);
router.get('/throughput', ctrl.getThroughput);
router.get('/errors', ctrl.getErrors);
router.get('/providers', ctrl.getProviders);

export default router;
