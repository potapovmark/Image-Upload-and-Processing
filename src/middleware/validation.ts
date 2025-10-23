import { Request, Response, NextFunction } from 'express';

export const validateProcessingOptions = (req: Request, res: Response, next: NextFunction) => {
  const { width, height, format, quality, fit, sharpen } = req.body;

  if (width && (typeof width !== 'number' || width <= 0)) {
    return res.status(400).json({ error: 'Width must be a positive number' });
  }

  if (height && (typeof height !== 'number' || height <= 0)) {
    return res.status(400).json({ error: 'Height must be a positive number' });
  }

  if (format && !['jpeg', 'png', 'webp', 'avif'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format. Supported: jpeg, png, webp, avif' });
  }

  if (quality && (typeof quality !== 'number' || quality < 1 || quality > 100)) {
    return res.status(400).json({ error: 'Quality must be a number between 1 and 100' });
  }

  if (fit && !['cover', 'contain', 'fill', 'inside', 'outside'].includes(fit)) {
    return res.status(400).json({ error: 'Invalid fit option' });
  }

  if (sharpen && typeof sharpen !== 'boolean') {
    return res.status(400).json({ error: 'Sharpen must be a boolean' });
  }

  next();
};

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  next();
};
