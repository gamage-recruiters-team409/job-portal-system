import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

const storage = multer.memoryStorage();

const createSingleFileUpload = ({
  fieldName,
  allowedMimeTypes,
  maxFileSize,
  invalidTypeMessage,
}) => {
  const upload = multer({
    storage,
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter(_req, file, callback) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new ApiError(400, invalidTypeMessage));
      }

      return callback(null, true);
    },
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) {
        return next();
      }

      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(413, `${fieldName} exceeds the allowed file size.`));
        }

        return next(new ApiError(400, error.message));
      }

      return next(error);
    });
  };
};

export const uploadJobSeekerProfileImage = createSingleFileUpload({
  fieldName: 'profileImage',
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  maxFileSize: 2 * 1024 * 1024,
  invalidTypeMessage: 'Only PNG and JPEG profile images are allowed.',
});

export const uploadJobSeekerCv = createSingleFileUpload({
  fieldName: 'cv',
  allowedMimeTypes: ['application/pdf'],
  maxFileSize: 5 * 1024 * 1024,
  invalidTypeMessage: 'Only PDF CV files are allowed.',
});
