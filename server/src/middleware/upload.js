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

const multerUpload = upload.single('companyLogo');

/**
 * Middleware that runs Multer for the company logo field and maps upload
 * errors to explicit HTTP status codes before they reach the global handler.
 *
 * - Invalid file type (plain Error from fileFilter) → 400
 * - File exceeds 2 MB (MulterError LIMIT_FILE_SIZE)  → 413
 * - Any other MulterError                            → 400
 */
export function uploadCompanyLogo(req, res, next) {
  multerUpload(req, res, (err) => {
    if (!err) {
      return next();
    }

    // LIMIT_FILE_SIZE is a MulterError — map to 413.
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(413, 'File exceeds the maximum allowed size of 2MB.'));
      }
      return next(new ApiError(400, err.message));
    }

    // fileFilter calls cb(new ApiError(400, ...)) for unsupported types.
    // Re-forward as-is; it already carries the correct statusCode.
    return next(err);
  });
}
