import express from 'express';

import * as fileController from '../controllers/file.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Upload routes (multer middleware must come after authenticateToken but before controller)
router.post('/upload', authenticateToken, fileController.upload.single('file'), fileController.uploadFile);
router.post('/upload-multiple', authenticateToken, fileController.upload.array('files', 10), fileController.uploadMultipleFiles);

// Get files by reference
router.get('/', authenticateToken, fileController.getFilesByReference);

// Serve file by ID (public access for file downloads)
router.get('/:id', fileController.serveFileById);

// Delete file
router.delete('/:id', authenticateToken, fileController.deleteFile);

export default router;

