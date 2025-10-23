import sharp from 'sharp';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import crypto from 'crypto';
import { ProcessingOptions, responsiveSizes } from '../config/sharp';

export class ImageService {
  async processImage(inputPath: string, outputPath: string, options: ProcessingOptions) {
    try {
      await fs.access(outputPath);
      return outputPath;
    } catch {
      let processor = sharp(inputPath);

      if (options.width || options.height) {
        processor = processor.resize(options.width, options.height, {
          fit: options.fit || 'cover'
        });
      }

      if (options.sharpen) {
        processor = processor.sharpen();
      }

      if (options.format) {
        switch (options.format) {
          case 'jpeg':
            processor = processor.jpeg({ quality: options.quality || 80 });
            break;
          case 'png':
            processor = processor.png({ quality: options.quality || 80 });
            break;
          case 'webp':
            processor = processor.webp({ quality: options.quality || 80 });
            break;
          case 'avif':
            processor = processor.avif({ quality: options.quality || 80 });
            break;
        }
      }

      if (options.watermark) {
        processor = processor.composite([{
          input: options.watermark,
          gravity: 'southeast'
        }]);
      }

      await processor.toFile(outputPath);
      return outputPath;
    }
  }

  async generateResponsiveImages(inputPath: string, baseFilename: string) {
    const results = [];
    const fileBuffer = await fs.readFile(inputPath);
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex').substring(0, 8);

    for (const size of responsiveSizes) {
      const outputPath = path.join('processed', `responsive-${fileHash}-${size.size}.webp`);

      await this.processImage(inputPath, outputPath, {
        width: size.width,
        height: size.height,
        format: 'webp',
        quality: 85,
        fit: 'cover'
      });

      results.push({
        size: size.size,
        width: size.width,
        height: size.height,
        url: `/processed/${path.basename(outputPath)}`
      });
    }

    return results;
  }

  async getImageMetadata(inputPath: string) {
    const metadata = await sharp(inputPath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      channels: metadata.channels,
      density: metadata.density
    };
  }

  async createThumbnail(inputPath: string, outputPath: string) {
    try {
      await fs.access(outputPath);
      return outputPath;
    } catch {
      await this.processImage(inputPath, outputPath, {
        width: 150,
        height: 150,
        format: 'jpeg',
        quality: 70,
        fit: 'cover'
      });
      return outputPath;
    }
  }

  async processImageStream(inputPath: string, outputPath: string) {
    const readStream = createReadStream(inputPath);
    const transformer = sharp().resize(800);
    const writeStream = createWriteStream(outputPath);

    await pipeline(readStream, transformer, writeStream);
  }
}
