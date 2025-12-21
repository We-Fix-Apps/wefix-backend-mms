import express from 'express';

import companyDataRoutes from './company-data.routes';
import fileRoutes from './file.routes';
import logRoutes from './log.routes';
import ticketRoutes from './ticket.routes';
import userRoutes from './user.routes';

const router = express.Router();

// API version 1 routes
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/tickets', ticketRoutes);
router.use('/company-data', companyDataRoutes);
router.use('/files', fileRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

