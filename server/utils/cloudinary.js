const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 string image to Cloudinary
 * @param {String} base64Image - The raw base64 data URI (e.g. 'data:image/jpeg;base64,...')
 * @param {String} folder - The destination folder in Cloudinary
 * @returns {Promise<String>} - The secure URL of the uploaded image
 */
const uploadBase64Image = async (base64Image, folder) => {
    if (!base64Image) return null;
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder,
            resource_type: 'image',
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

module.exports = { cloudinary, uploadBase64Image };
