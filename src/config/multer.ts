import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const deduplicateFile = async (req: any, res: any, next: any) => {
  if (req.file) {
    try {
      const fileBuffer = await fs.readFile(req.file.path);
      const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex').substring(0, 12);
      const extension = path.extname(req.file.originalname);
      const newFilename = `image-${fileHash}${extension}`;
      const newPath = path.join('uploads', newFilename);

      try {
        await fs.access(newPath);
        await fs.unlink(req.file.path);
        req.file.filename = newFilename;
        req.file.path = newPath;
      } catch {
        await fs.rename(req.file.path, newPath);
        req.file.filename = newFilename;
        req.file.path = newPath;
      }
    } catch (error) {
      console.error('File deduplication error:', error);
    }
  }

  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

    for (const file of files) {
      try {
        const fileBuffer = await fs.readFile(file.path);
        const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex').substring(0, 12);
        const extension = path.extname(file.originalname);
        const newFilename = `image-${fileHash}${extension}`;
        const newPath = path.join('uploads', newFilename);

        try {
          await fs.access(newPath);
          await fs.unlink(file.path);
          file.filename = newFilename;
          file.path = newPath;
        } catch {
          await fs.rename(file.path, newPath);
          file.filename = newFilename;
          file.path = newPath;
        }
      } catch (error) {
        console.error('File deduplication error:', error);
      }
    }
  }

  next();
};

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
