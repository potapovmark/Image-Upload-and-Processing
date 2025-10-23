import { Router } from 'express';
import { processImage, getMetadata, convertFormat } from '../controllers/processController';
import { validateProcessingOptions } from '../middleware/validation';

const router = Router();

router.post('/:filename', validateProcessingOptions, processImage);
router.get('/metadata/:filename', getMetadata);
router.post('/convert/:filename', convertFormat);

export default router;
