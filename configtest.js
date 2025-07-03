const cloudinary = require("cloudinary").v2;
const fs = require('fs');
const path = require('path');

// Function to test Cloudinary upload with a local file
async function testCloudinaryUpload() {
  try {
    // Find a sample image in common locations
    const possibleImagePaths = [
      path.join(__dirname, 'test-image.jpg'),
      path.join(__dirname, 'public', 'test-image.jpg'),
      path.join(__dirname, 'uploads', 'test-image.jpg')
    ];

    let imagePath = null;
    for (const testPath of possibleImagePaths) {
      if (fs.existsSync(testPath)) {
        imagePath = testPath;
        break;
      }
    }

    if (!imagePath) {
      console.error("No test image found. Please add a test-image.jpg to your project.");
      return false;
    }

    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "test-uploads",
      timeout: 60000 // Increase timeout to 60 seconds
    });

    console.log("🖼️ Upload Test Successful!");
    console.log("Uploaded Image URL:", result.secure_url);
    console.log("Public ID:", result.public_id);

    // Optional: Delete the uploaded test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log("Test image deleted from Cloudinary");

    return true;
  } catch (error) {
    console.error("Upload Test Failed:", error);
    return false;
  }
}

module.exports = { testCloudinaryUpload };