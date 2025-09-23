import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ImageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), "uploads");
    this.ensureUploadsDir();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  createMulterStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
  }

  createMulterUpload() {
    const storage = this.createMulterStorage();
    
    return multer({
      storage,
      limits: {
        fileSize: 8 * 1024 * 1024, // 8MB
        files: 10 // Maximum 10 files
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
          return cb(null, true);
        } else {
          cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
        }
      }
    });
  }

  async validateImage(filePath: string): Promise<ImageValidationResult> {
    const result: ImageValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const stats = fs.statSync(filePath);
      
      // Check file size
      if (stats.size > 8 * 1024 * 1024) {
        result.errors.push("File size exceeds 8MB limit");
        result.isValid = false;
      }

      if (stats.size < 10 * 1024) {
        result.errors.push("File size too small, may be corrupted");
        result.isValid = false;
      }

      // Basic dimension check would require image processing library
      // For MVP, we'll validate based on file properties
      
      return result;
    } catch (error) {
      result.errors.push("Could not read image file");
      result.isValid = false;
      return result;
    }
  }

  async deleteImage(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  getImagePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }

  getImageUrl(filename: string, siteUrl: string): string {
    return `${siteUrl}/uploads/${filename}`;
  }
}
