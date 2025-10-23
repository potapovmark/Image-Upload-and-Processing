import { Request, Response } from 'express';
import { ImageService } from '../services/imageService';
import { ProcessingOptions } from '../config/sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { getCachedImage, setCachedImage } from '../services/cacheService';

const imageService = new ImageService();

export const processImage = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const options: ProcessingOptions = req.body;

    const inputPath = path.join('uploads', filename);

    try {
      await fs.access(inputPath);
    } catch {
      return res.status(404).json({ error: 'Image not found' });
    }

    const cacheKey = `${filename}-${JSON.stringify(options)}`;
    const outputFilename = `processed-${crypto.createHash('md5').update(cacheKey).digest('hex')}.${options.format || 'jpg'}`;
    const outputPath = path.join('processed', outputFilename);

    try {
      await fs.access(outputPath);
      const existingBuffer = await fs.readFile(outputPath);
      res.set({
        'Content-Type': `image/${options.format || 'jpeg'}`,
        'Cache-Control': 'public, max-age=3600'
      });
      return res.send(existingBuffer);
    } catch {
      const cachedImage = await getCachedImage(cacheKey);

      if (cachedImage) {
        await fs.writeFile(outputPath, cachedImage);
        res.set({
          'Content-Type': `image/${options.format || 'jpeg'}`,
          'Cache-Control': 'public, max-age=3600'
        });
        return res.send(cachedImage);
      }

      await imageService.processImage(inputPath, outputPath, options);
      const processedBuffer = await fs.readFile(outputPath);
      await setCachedImage(cacheKey, processedBuffer);

      res.set({
        'Content-Type': `image/${options.format || 'jpeg'}`,
        'Cache-Control': 'public, max-age=3600'
      });
      res.send(processedBuffer);
    }
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
};

export const getMetadata = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const inputPath = path.join('uploads', filename);

    try {
      await fs.access(inputPath);
    } catch {
      return res.status(404).json({ error: 'Image not found' });
    }

    const metadata = await imageService.getImageMetadata(inputPath);

    res.json({
      filename: filename,
      metadata: metadata
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metadata' });
  }
};

export const convertFormat = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { format, quality } = req.body;

    if (!format) {
      return res.status(400).json({ error: 'Format is required' });
    }

    const inputPath = path.join('uploads', filename);

    try {
      await fs.access(inputPath);
    } catch {
      return res.status(404).json({ error: 'Image not found' });
    }

    const outputFilename = `${path.parse(filename).name}.${format}`;
    const outputPath = path.join('processed', outputFilename);

    try {
      await fs.access(outputPath);
      res.json({
        message: 'Format conversion successful (file already exists)',
        original: filename,
        converted: {
          filename: outputFilename,
          url: `/processed/${outputFilename}`,
          format: format
        }
      });
    } catch {
      await imageService.processImage(inputPath, outputPath, {
        format: format as any,
        quality: quality || 80
      });

      res.json({
        message: 'Format conversion successful',
        original: filename,
        converted: {
          filename: outputFilename,
          url: `/processed/${outputFilename}`,
          format: format
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Format conversion failed' });
  }
};
