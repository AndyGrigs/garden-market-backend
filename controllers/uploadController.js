import multer from "multer";
import path from "path";
import fs from "fs";
import { getUserLanguage } from "../utils/langDetector.js";
import {t} from '../localisation.js'

// Дозволені типи файлів
const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Створення папки для збереження фото, якщо її немає
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Конфігурація Multer для збереження файлів
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Унікальне ім'я файлу
  },
});

// Перевірка типу файлу
const fileFilter = (req, file, cb) => {
  const userLang = getUserLanguage(req);
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(t(userLang, "errors.upload.invalid_file_type"));
    error.code = "INVALID_FILE_TYPE";
    return cb(error, false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// Контролер для завантаження файлу
export const uploadImage = [
  upload.single("image"),
  (req, res) => {
    const userLang = getUserLanguage(req);
    if (!req.file) {
      return res
        .status(400)
        .json({ message: t(userLang, "errors.upload.no_file") });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      imageUrl,
      message: t(userLang, "success.upload.uploaded"),
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  },

  (error, req, res, next) => {
    const userLang = getUserLanguage(req);

    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case "LIMIT_FILE_SIZE":
          return res.status(400).json({
            message: t(userLang, "errors.upload.file_too_large", {
              maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            }),
          });
        case "LIMIT_FILE_COUNT":
          return res.status(400).json({
            message: t(userLang, "errors.upload.too_many_files"),
          });
        case "LIMIT_UNEXPECTED_FILE":
          return res.status(400).json({
            message: t(userLang, "errors.upload.unexpected_field"),
          });
        default:
          return res.status(400).json({
            message: t(userLang, "errors.upload.general"),
          });
      }
    }

    if (error.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Upload error:", error);
    res.status(500).json({
      message: t(userLang, "errors.server_error"),
    });
  },
];

export const deleteImage = (req, res) => {
  const { filename } = req.params;
  const userLang = getUserLanguage(req);

  // Validate filename
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ 
      message: t(userLang, "errors.upload.invalid_filename")
    });
  }

  // Security check: prevent path traversal attacks
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ 
      message: t(userLang, "errors.upload.invalid_filename")
    });
  }

  const filePath = path.resolve("uploads", filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      message: t(userLang, "errors.upload.file_not_found")
    });
  }

  // Delete file
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Image deletion error:", err);
      return res.status(500).json({ 
        message: t(userLang, "errors.upload.delete_failed")
      });
    }

    res.json({ 
      message: t(userLang, "success.upload.deleted")
    });
  });
};


// Get image info controller (bonus feature)
export const getImageInfo = (req, res) => {
  const { filename } = req.params;
  const userLang = getUserLanguage(req);

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ 
      message: t(userLang, "errors.upload.invalid_filename")
    });
  }

  // Security check
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ 
      message: t(userLang, "errors.upload.invalid_filename")
    });
  }

  const filePath = path.resolve("uploads", filename);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      return res.status(404).json({ 
        message: t(userLang, "errors.upload.file_not_found")
      });
    }

    res.json({
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      url: `/uploads/${filename}`,
      message: t(userLang, "success.upload.info_retrieved")
    });
  });
};

// Helper function to delete old image file when replacing with new one
export const deleteOldImageFile = (oldImageUrl) => {
  if (!oldImageUrl || !oldImageUrl.includes('/uploads/')) {
    return;
  }

  try {
    const filename = oldImageUrl.replace('/uploads/', '');
    const filePath = path.resolve('uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('❌ Error deleting old image:', error);
  }
};

// Helper function to get all used image URLs from database
export const getAllUsedImages = async () => {
  try {
    // Import models dynamically to avoid circular dependencies
    const { default: TreeSchema } = await import('../models/tree.js');
    const { default: CategorySchema } = await import('../models/category.js');

    const usedImages = new Set();

    // Get all tree images
    const trees = await TreeSchema.find({ imageUrl: { $exists: true, $ne: null } }, 'imageUrl');
    trees.forEach(tree => {
      if (tree.imageUrl && tree.imageUrl.includes('/uploads/')) {
        const filename = tree.imageUrl.replace('/uploads/', '');
        usedImages.add(filename);
      }
    });

    // Get all category images
    const categories = await CategorySchema.find({ imageUrl: { $exists: true, $ne: null } }, 'imageUrl');
    categories.forEach(category => {
      if (category.imageUrl && category.imageUrl.includes('/uploads/')) {
        const filename = category.imageUrl.replace('/uploads/', '');
        usedImages.add(filename);
      }
    });

    return usedImages;
  } catch (error) {
    console.error('Error getting used images:', error);
    return new Set();
  }
};

export const cleanupUnusedFiles = async (req, res) => {
  const userLang = getUserLanguage(req);

  try {
    const files = fs.readdirSync(uploadDir);
    const usedImages = await getAllUsedImages();

    let deletedCount = 0;
    const deletedFiles = [];

    for (const file of files) {
      // Skip if file is not an image
      if (!/\.(jpg|jpeg|png)$/i.test(file)) {
        continue;
      }

      // If file is not used in database, delete it
      if (!usedImages.has(file)) {
        const filePath = path.join(uploadDir, file);
        try {
          fs.unlinkSync(filePath);
          deletedFiles.push(file);
          deletedCount++;
        } catch (deleteError) {
          console.error(`❌ Error deleting ${file}:`, deleteError);
        }
      }
    }

    res.json({
      message: t(userLang, "success.upload.cleanup_completed", {
        count: deletedCount
      }),
      deletedFiles: deletedCount,
      deletedFilesList: deletedFiles
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      message: t(userLang, "errors.upload.cleanup_failed")
    });
  }
};

export const cleanupOldFiles = async (req, res) => {
  const userLang = getUserLanguage(req);
  const daysOld = parseInt(req.query.days) || 30; // Default 30 days

  try {
    const files = fs.readdirSync(uploadDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);

      if (stats.birthtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    res.json({
      message: t(userLang, "success.upload.cleanup_completed", {
        count: deletedCount,
        days: daysOld
      }),
      deletedFiles: deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      message: t(userLang, "errors.upload.cleanup_failed")
    });
  }
};
