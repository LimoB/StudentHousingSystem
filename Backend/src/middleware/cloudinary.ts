import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Storage Engine for Units
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'rental_app/units',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `unit-${Date.now()}-${file.originalname.split('.')[0]}`,
      // REMOVED: transformation width/height/crop to keep original quality
    };
  },
});

// 3. Export the Multer middleware
export const upload = multer({ 
  storage: storage,
  // REMOVED: limits (fileSize) to allow any size (subject to Cloudinary's account limits)
});

export default cloudinary;