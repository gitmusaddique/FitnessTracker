import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const uploadDirs = [
  'uploads/trainers',
  'uploads/gyms', 
  'uploads/users',
  'uploads/meals'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Custom storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on the endpoint
    if (req.url.includes('/trainers')) {
      uploadPath += 'trainers/';
    } else if (req.url.includes('/gyms')) {
      uploadPath += 'gyms/';
    } else if (req.url.includes('/users') || req.url.includes('/profile')) {
      uploadPath += 'users/';
    } else if (req.url.includes('/meals')) {
      uploadPath += 'meals/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter
});

// Image processing utility
export async function processImage(filePath: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}): Promise<string> {
  const { width = 800, height = 600, quality = 80 } = options || {};
  
  try {
    const outputPath = filePath.replace(path.extname(filePath), '_processed.jpg');
    
    await sharp(filePath)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toFile(outputPath);
    
    // Remove original file
    fs.unlinkSync(filePath);
    
    return outputPath;
  } catch (error) {
    console.error('Image processing error:', error);
    return filePath; // Return original if processing fails
  }
}

// Utility to get full URL for uploaded file
export function getFileUrl(filePath: string): string {
  return filePath.replace(/^uploads\//, '/uploads/');
}

// Clean up old files utility
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('File deletion error:', error);
  }
}