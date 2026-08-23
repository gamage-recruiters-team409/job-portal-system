import cloudinary from '../config/cloudinary.js';

const PROFILE_IMAGE_FOLDER = 'job_seeker_profiles/profile_images';
const CV_FOLDER = 'job_seeker_profiles/cvs';

const CV_DELIVERY_TYPE = 'authenticated';
const CV_DOWNLOAD_TTL_SECONDS = 5 * 60;

const uploadBufferToCloudinary = ({ buffer, folder, resourceType, deliveryType = 'upload' }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        type: deliveryType,
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error('Cloudinary did not return an upload result.'));
        }

        return resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          deliveryType: result.type,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });

const deleteCloudinaryAsset = async (publicId, resourceType, deliveryType = 'upload') => {
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: deliveryType,
    invalidate: true,
  });
};

export const uploadJobSeekerProfileImage = async (buffer) =>
  uploadBufferToCloudinary({
    buffer,
    folder: PROFILE_IMAGE_FOLDER,
    resourceType: 'image',
  });

export const uploadJobSeekerCv = async (buffer) =>
  uploadBufferToCloudinary({
    buffer,
    folder: CV_FOLDER,
    resourceType: 'raw',
    deliveryType: CV_DELIVERY_TYPE,
  });

export const deleteJobSeekerProfileImage = async (publicId) =>
  deleteCloudinaryAsset(publicId, 'image');

export const deleteJobSeekerCv = async (publicId) =>
  deleteCloudinaryAsset(publicId, 'raw', CV_DELIVERY_TYPE);

export const generateJobSeekerCvDownloadUrl = (publicId) => {
  const expiresAt = Math.floor(Date.now() / 1000) + CV_DOWNLOAD_TTL_SECONDS;

  const downloadUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
    resource_type: 'raw',
    type: CV_DELIVERY_TYPE,
    expires_at: expiresAt,
    attachment: true,
  });

  return {
    downloadUrl,
    expiresAt,
  };
};
