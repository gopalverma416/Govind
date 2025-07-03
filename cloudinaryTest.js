const cloudinary = require("cloudinary").v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: "denstpvkw",
  api_key: "286826859161274",
  api_secret: "nPceTG837d4AokcR7ym8iruyIIU",
});

// Function to test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.usage();
    console.log("Cloudinary Connection Successful!🔥");
    console.log("Cloudinary Account Details:", result);
    return true;
  } catch (error) {
    console.error("Cloudinary Connection Failed:", error);
    return false;
  }
}

// Additional test to check upload functionality
async function testCloudinaryUpload() {
  try {
    // Find a test image
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

    console.log("Upload Test Successful!");
    console.log("Uploaded Image URL:", result.secure_url);
    
    // Optional: Delete the uploaded test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log("Test image deleted from Cloudinary");

    return true;
  } catch (error) {
    console.error("Upload Test Failed:", error);
    return false;
  }
}
////
async function testCloudinaryMultipleUpload() {
  try {
    // Find multiple test images
    const possibleImagePaths = [
      path.join(__dirname, 'test-image.jpg'),
      path.join(__dirname, 'public', 'test-image.jpg'),
      path.join(__dirname, 'uploads', 'test-image.jpg')
    ];

    const imagePaths = possibleImagePaths.filter(fs.existsSync);

    if (imagePaths.length === 0) {
      console.error("No test images found. Please add test-image1.jpg, test-image2.jpg, or test-image3.jpg to your project.");
      return false;
    }

    // Upload the images
    const uploadPromises = imagePaths.map(async (imagePath) => {
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: "test-uploads",
        timeout: 60000 // Increase timeout to 60 seconds
      });
      console.log(`Upload Successful! Image URL: ${result.secure_url}`);
      return result;
    });

    const results = await Promise.all(uploadPromises);

    // Optional: Delete the uploaded test images
    for (const result of results) {
      await cloudinary.uploader.destroy(result.public_id);
      console.log(`Test image ${result.public_id} deleted from Cloudinary`);
    }

    console.log("⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐All test images uploaded and deleted successfully⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐.");
    return true;
  } catch (error) {
    console.error("Multiple Upload Test Failed:", error);
    return false;
  }
}

// Combine connection and upload tests
async function fullCloudinaryTest() {
  console.log("Starting Cloudinary Connection Test...");
  
  const connectionTest = await testCloudinaryConnection();
  const uploadTest = await testCloudinaryUpload();
  const uploadTest1 = await testCloudinaryMultipleUpload();

  if (connectionTest && uploadTest) {
    console.log("✅ Full Cloudinary Connection Test Passed!");
  } else {
    console.log("❌ Cloudinary Connection Test Failed");
  }
}

// Run the test
fullCloudinaryTest();

// Export for potential use in other files
module.exports = {
  cloudinary,
  testCloudinaryConnection,
  testCloudinaryUpload,
  fullCloudinaryTest
};