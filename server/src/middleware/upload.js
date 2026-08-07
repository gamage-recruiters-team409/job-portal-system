import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // ApiError carries statusCode through multer's callback untouched, so the
    // central error handler maps this to 400 instead of falling through to 500.
    cb(new ApiError(400, 'Only PNG and JPEG images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
  },
  fileFilter,
});

export const uploadCompanyLogo = upload.single('companyLogo');
