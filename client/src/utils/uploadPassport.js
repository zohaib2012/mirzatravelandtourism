import api from "../services/api";

// Directly browser se Cloudinary ko upload karta hai
// Backend sirf signature deta hai (< 100ms) — Vercel timeout ka koi risk nahi
export const uploadPassportDirect = async (file) => {
  // Step 1: Backend se signature lo (instant)
  const { data } = await api.get("/upload/signature");

  // Step 2: File directly Cloudinary ko bhejo (browser → Cloudinary)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", data.apiKey);
  formData.append("timestamp", data.timestamp);
  formData.append("signature", data.signature);
  formData.append("folder", data.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) throw new Error("Cloudinary upload failed");

  const result = await response.json();
  return result.secure_url;
};
