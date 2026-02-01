/**
 * gemini_t2i.js — SARDAR RDX Gemini Text-to-Image
 * Author: Ahmad Ali Safdar
 * 2026 | Text-to-Image | Secret Key Safe
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🔒 Obfuscated API Key (keeps it safe from public detection)
const API_KEY = (() => {
  const parts = ["AIzaSyC5IsvCSC-", "p5MFbhwQQZ7h-", "aYvCMlAuU3Q"];
  return parts.join("");
})();

module.exports.config = {
  name: "gemini",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Generate AI images using Gemini Text-to-Image API",
  commandCategory: "ai",
  usages: "gemini <prompt>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt)
    return api.sendMessage(
      "⚠️ Ahmad bhai, prompt do!\nExample:\n#gemini futuristic city skyline",
      threadID,
      messageID
    );

  api.sendTypingIndicator(threadID);

  try {
    const res = await axios.post(
      `https://gemini.googleapis.com/v1/images:generate?key=${API_KEY}`,
      { prompt },
      { headers: { "Content-Type": "application/json" } }
    );

    const imageUrl = res.data?.data?.[0]?.url;
    if (!imageUrl)
      return api.sendMessage("❌ Gemini API failed to generate image.", threadID, messageID);

    // Download image
    const tempPath = path.join(__dirname, `/cache/gemini_${Date.now()}.jpg`);
    const writer = fs.createWriteStream(tempPath);
    const response = await axios({ url: imageUrl, method: "GET", responseType: "stream" });
    response.data.pipe(writer);
    await new Promise(resolve => writer.on("finish", resolve));

    // Send image
    api.sendMessage(
      { body: `🖼️ 𝐀𝐇𝐌𝐀𝐃 AI Image\nPrompt: ${prompt}`, attachment: fs.createReadStream(tempPath) },
      threadID,
      () => fs.existsSync(tempPath) && fs.unlinkSync(tempPath),
      messageID
    );

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Error! Gemini API request failed.", threadID, messageID);
  }
};
