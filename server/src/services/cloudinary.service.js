import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a buffer to Cloudinary and returns the secure URL.
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} Secure URL of the uploaded image
 */
export const uploadToCloudinary = (buffer, folder = 'company_logos') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};
