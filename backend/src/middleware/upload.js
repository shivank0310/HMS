const multer = require('multer');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/index');
const ApiError = require('../utils/ApiError');

fs.mkdirSync(appConfig.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, appConfig.uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: appConfig.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|jpg|jpeg|png|doc|docx|txt|dcm)$/i;
    if (allowed.test(path.extname(file.originalname))) return cb(null, true);
    return cb(new ApiError('Unsupported file type', 400));
  },
});

module.exports = upload;
