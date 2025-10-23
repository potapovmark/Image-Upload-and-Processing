import { Request, Response } from 'express';
import { ImageService } from '../services/imageService';
import path from 'path';

const imageService = new ImageService();

export const uploadSingle = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const thumbnailPath = path.join('processed', `thumb-${req.file.filename}`);
    await imageService.createThumbnail(req.file.path, thumbnailPath);

    res.json({
      message: 'Image uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        thumbnail: `/processed/${path.basename(thumbnailPath)}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const uploadMultiple = async (req: Request, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    const results = [];

    for (const file of files) {
      const thumbnailPath = path.join('processed', `thumb-${file.filename}`);
      await imageService.createThumbnail(file.path, thumbnailPath);

      results.push({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        thumbnail: `/processed/${path.basename(thumbnailPath)}`
      });
    }

    res.json({
      message: 'Images uploaded successfully',
      files: results
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const uploadResponsive = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const baseFilename = path.parse(req.file.filename).name;
    const responsiveImages = await imageService.generateResponsiveImages(req.file.path, baseFilename);

    res.json({
      message: 'Responsive images generated successfully',
      original: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`
      },
      responsive: responsiveImages
    });
  } catch (error) {
    res.status(500).json({ error: 'Responsive upload failed' });
  }
};
