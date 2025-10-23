import { Router } from 'express';
import { uploadSingle, uploadMultiple, uploadResponsive } from '../controllers/uploadController';
import { processImage, getMetadata, convertFormat } from '../controllers/processController';
import { upload, deduplicateFile } from '../config/multer';
import { validateProcessingOptions, validateFileUpload } from '../middleware/validation';

const router = Router();

router.post('/single', upload.single('image'), deduplicateFile, validateFileUpload, uploadSingle);
router.post('/multiple', upload.array('images', 10), deduplicateFile, validateFileUpload, uploadMultiple);
router.post('/responsive', upload.single('image'), deduplicateFile, validateFileUpload, uploadResponsive);

router.post('/process/:filename', validateProcessingOptions, processImage);
router.get('/metadata/:filename', getMetadata);
router.post('/convert/:filename', convertFormat);

export default router;
