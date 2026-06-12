const multer  = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store files in memory so we can stream them to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'), false);
};

// Accept up to 5 images, max 5MB each
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

/**
 * Upload a buffer to Cloudinary and return the secure URL
 * @param {Buffer} buffer
 * @param {string} folder  — e.g. 'ecommerce/products'
 * @returns {Promise<string>} secure_url
 */
function uploadToCloudinary(buffer, folder = 'ecommerce/products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

module.exports = { upload, uploadToCloudinary, cloudinary };
