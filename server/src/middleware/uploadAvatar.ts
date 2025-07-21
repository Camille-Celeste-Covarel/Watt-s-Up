import path from "node:path";
import type { Request } from "express";
import multer from "multer";

const profilUpload = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, "uploads/avatars/");
    } else if (file.fieldname === "vehicle_photo") {
      cb(null, "uploads/vehicle_photos/");
    } else {
      cb(null, "uploads/");
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});
const upload = multer({ storage: profilUpload });
const multiUpload = multer({ storage: profilUpload });

const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Le fichier n'est pas une image !"));
  }
};

const uploadAvatar = multer({
  storage: profilUpload,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export default uploadAvatar;
