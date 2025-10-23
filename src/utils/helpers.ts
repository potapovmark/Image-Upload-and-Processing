import fs from 'fs/promises';
import path from 'path';

export const ensureDirectories = async () => {
  const directories = ['uploads', 'processed', 'cache'];

  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

export const generateUniqueFilename = (originalname: string): string => {
  const ext = path.extname(originalname);
  const name = path.parse(originalname).name;
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  return `${name}-${timestamp}-${random}${ext}`;
};

export const isValidImageFormat = (mimetype: string): boolean => {
  const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'];
  return validFormats.includes(mimetype);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
