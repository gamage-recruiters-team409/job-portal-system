import cloudinary from '../config/cloudinary.js';

const PROFILE_IMAGE_FOLDER = 'job_seeker_profiles/profile_images';
const CV_FOLDER = 'job_seeker_profiles/cvs';

const uploadBufferToCloudinary = ({ buffer, folder, resourceType }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
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
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });

const deleteCloudinaryAsset = async (publicId, resourceType) => {
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
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
  });

export const deleteJobSeekerProfileImage = async (publicId) =>
  deleteCloudinaryAsset(publicId, 'image');

export const deleteJobSeekerCv = async (publicId) => deleteCloudinaryAsset(publicId, 'raw');
