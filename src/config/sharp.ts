import sharp from 'sharp';

export interface ProcessingOptions {
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  sharpen?: boolean;
  watermark?: string;
}

export const defaultOptions: ProcessingOptions = {
  width: 800,
  height: 600,
  format: 'jpeg',
  quality: 80,
  fit: 'cover',
  sharpen: false
};

export const responsiveSizes = [
  { size: 'small', width: 320, height: 240 },
  { size: 'medium', width: 640, height: 480 },
  { size: 'large', width: 1024, height: 768 },
  { size: 'xlarge', width: 1920, height: 1080 }
];
