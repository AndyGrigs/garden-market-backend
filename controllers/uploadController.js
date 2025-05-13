import multer from "multer";
import path from "path";
import fs from "fs";

// Створити папку "uploads", якщо не існує
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Налаштування збереження
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

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
