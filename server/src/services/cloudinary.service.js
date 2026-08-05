import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a buffer to Cloudinary and returns both secure_url and public_id.
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{ secure_url: string, public_id: string }>} Upload result containing URL and public ID
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
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<object>} Deletion result from Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};
