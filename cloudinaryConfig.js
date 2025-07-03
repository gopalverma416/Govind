const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");  // ✅ Import the path module
const fs = require("fs");


// Configure Cloudinary with hardcoded credentials
cloudinary.config({
  cloud_name: "denstpvkw", 
  api_key: "286826859161274", 
  api_secret: "nPceTG837d4AokcR7ym8iruyIIU",
});

// Create multer storage with manual upload

const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 🔹 Multer Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder: "jewelry-images" }, (error, result) => {
      if (error) reject(error);
      else {
        fs.unlinkSync(filePath); // Delete local file after upload
        resolve(result.secure_url); // Return Cloudinary URL
      }
    });
  });
};
const uploadMultipleToCloudinary = async (filePaths) => {
  try {
    const uploadPromises = filePaths.map(async (filePath) => {
      const result = await cloudinary.uploader.upload(filePath, { folder: "jewelry-images" });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete local file after upload
      }

      return result.secure_url; // Return Cloudinary URL
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error) {
    console.error("Cloudinary Multiple Upload Error:", error);
    throw error;
  }
};



module.exports = { upload, uploadToCloudinary,uploadMultipleToCloudinary};
