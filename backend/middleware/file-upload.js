const multer = require("multer");
const { uuid } = require("uuidv4");
const MIME_TYPE_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("invalide Mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
