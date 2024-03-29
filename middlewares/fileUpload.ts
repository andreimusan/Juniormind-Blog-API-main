/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
import multer from "multer";
import path from "path";
import util from "util";

const maxSize = 2 * 1024 * 1024;
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "images");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const fileTypes = /jpeg|jpg|png|gif|tiff/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) cb(null, true);
  else cb(new Error("LIMIT_FILE_TYPE"));
};

const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter,
}).single("file");

const addToRequest = multer({
  limits: { fileSize: maxSize },
  fileFilter,
}).single("file");

export const uploadFile = util.promisify(upload);
export const addFileToRequest = util.promisify(addToRequest);
