import express from 'express';

import * as logController from '../controllers/log.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// All log routes require authentication
router.get('/', authenticateToken, logController.getAllLogs);

export default router;


