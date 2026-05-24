import { Router } from 'express';
import * as ctrl from '../controllers/conversation.controller.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
