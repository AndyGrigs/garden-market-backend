import multer from "multer";
import path from "path";
import fs from "fs";

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

// Створити папку "uploads", якщо не існує
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Недопустимий тип файлу. Дозволено лише JPG та PNG"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Контролер
export const uploadImage = [
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Файл не отримано" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  },
];
