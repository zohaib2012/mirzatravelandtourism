import cloudinary from "../config/cloudinary.js";

// Backend sirf signature generate karta hai (< 100ms)
// File directly browser se Cloudinary ko jati hai — Vercel bypass
export const getUploadSignature = (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "mirza-travel/passports";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).json({ message: "Could not generate upload signature" });
  }
};
