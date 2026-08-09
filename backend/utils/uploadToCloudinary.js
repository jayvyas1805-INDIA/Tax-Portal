import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a file buffer (from multer memory storage) to Cloudinary
 * and resolves with the secure URL.
 */
export const uploadToCloudinary = (fileBuffer, folder, publicIdPrefix) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `partner-portal/${folder}`,
        public_id: `${publicIdPrefix}-${Date.now()}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
