import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG and JPEG images are allowed'), false);
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
