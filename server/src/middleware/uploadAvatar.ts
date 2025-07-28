import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "";
    if (file.fieldname === "avatar") {
      dest = path.join(__dirname, "..", "..", "public/uploads/avatars");
    } else if (file.fieldname === "vehicle_photo") {
      dest = path.join(__dirname, "..", "..", "public/uploads/vehicules");
    }
    // Crée le dossier si besoin
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées !"));
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
});

export default uploadAvatar;
