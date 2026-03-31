import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist
const uploadDirs = [
  './uploads/kyc',
  './uploads/giftcards',
  './uploads/appeals',
  './uploads/avatars'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = './uploads/';
    
    if (req.originalUrl.includes('/kyc')) {
      uploadPath += 'kyc';
    } else if (req.originalUrl.includes('/giftcards')) {
      uploadPath += 'giftcards';
    } else if (req.originalUrl.includes('/appeals')) {
      uploadPath += 'appeals';
    } else {
      uploadPath += 'avatars';
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = req.originalUrl.includes('/kyc') ? 'kyc' : 
                   req.originalUrl.includes('/giftcards') ? 'card' : 'file';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
    files: 5
  }
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple files upload middleware
export const uploadMultiple = (fields: { name: string; maxCount: number }[]) => {
  return upload.fields(fields);
};

// KYC document upload
export const uploadKycDocuments = upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 }
]);

// Gift card images upload
export const uploadGiftCardImages = upload.fields([
  { name: 'imageFront', maxCount: 1 },
  { name: 'imageBack', maxCount: 1 },
  { name: 'imageScratched', maxCount: 1 }
]);

// Error handler for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.',
        code: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in file upload.',
        code: 'UNEXPECTED_FIELD'
      });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'UPLOAD_ERROR'
    });
  }
  
  next();
};
