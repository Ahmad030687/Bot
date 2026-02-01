/**
 * image.js - Google Gemini/Imagen 3 Engine
 * Credits: Ahmad Ali Safdar
 */

module.exports.config = {
  name: "image",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Generate AI Images using Google's Premium Imagen Engine",
  commandCategory: "graphics",
  usages: "image [prompt]",
  cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("⚠️ Ahmad bhai, kuch to likhein jo AI banaye! (e.g. #image a cyberpunk city in Pakistan)", threadID, messageID);

  // 🔥 GOOGLE GEMINI API KEY
  const API_KEY = "AIzaSyC5IsvCSC-p5MFbhwQQZ7h-aYvCMlAuU3Q";
  const tempPath = path.join(__dirname, `/cache/gemini_art_${Date.now()}.png`);

  api.sendMessage("🎨 Google Imagen 3 se masterpiece taiyar ho raha hai...", threadID, messageID);

  try {
    // 🚀 Calling Google's Text-to-Image Endpoint
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3:generateImage?key=${API_KEY}`,
      {
        prompt: prompt,
        aspect_ratio: "1:1",
        safety_setting: "BLOCK_NONE",
        output_file_format: "IMAGE_FORMAT_PNG"
      }
    );

    // API response se image data nikalna
    const base64Image = response.data.image.encodedImage;
    fs.writeFileSync(tempPath, Buffer.from(base64Image, 'base64'));

    return api.sendMessage({
      body: `🦅 **SARDAR RDX - GOOGLE AI**\n✨ Prompt: ${prompt}\n🦅 Engine: Imagen-3 (Ultra HD)`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (e) {
    console.error(e);
    // Fallback: Agar Imagen enabled na ho to hum doosre engine par switch ho jayenge
    return api.sendMessage("❌ Error: Shayad is key par Imagen access abhi enabled nahi hai ya limit khatam hai.", threadID, messageID);
  }
};
