/**
 * t2i.js — SIGMA Gemini Text-to-Image Generator
 * Author: Ahmad Ali Safdar
 * 2026 | Works with prompt like #t2i black honda civic 2025
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_KEY = "AIzaSyC5IsvCSC-p5MFbhwQQZ7h-aYvCMlAuU3Q";

module.exports.config = {
  name: "image",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Generate AI images from text using Gemini API",
  commandCategory: "graphics",
  usages: "t2i [prompt]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt)
    return api.sendMessage(
      "⚠️ Ahmad bhai, image ke liye prompt do!\nExample: #t2i black honda civic 2025",
      threadID,
      messageID
    );

  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const tempPath = path.join(cacheDir, `t2i_${Date.now()}.png`);

  api.sendMessage("🎨 Gemini AI brain kaam kar rha hai... Thodi der...", threadID, messageID);

  try {
    // --- STEP 1: Enhance prompt using Gemini ---
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Expand this text prompt for high-quality AI image generation. Output ONLY the expanded prompt in English: ${prompt}`
              }
            ]
          }
        ]
      }
    );

    const enhancedPrompt = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    console.log("Enhanced Prompt:", enhancedPrompt);

    // --- STEP 2: Generate image using Pollinations Flux ---
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&model=flux`;

    const imgData = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(tempPath, Buffer.from(imgData, 'binary'));

    return api.sendMessage(
      {
        body: `🦅 **SIGMA AI STUDIO**\n✨ Original: ${prompt}\n🧠 Enhanced: ${enhancedPrompt}\n🎨 Engine: Gemini + Flux`,
        attachment: fs.createReadStream(tempPath)
      },
      threadID,
      () => fs.existsSync(tempPath) && fs.unlinkSync(tempPath),
      messageID
    );

  } catch (err) {
    console.error(err);

    // --- FALLBACK ENGINE (Samir.site Flux) ---
    try {
      const fallbackUrl = `https://api.samir.site/gen/flux?prompt=${encodeURIComponent(prompt)}`;
      const fbData = (await axios.get(fallbackUrl, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(tempPath, Buffer.from(fbData, 'binary'));

      return api.sendMessage(
        { body: "🦅 **SIGMA AI Fallback Engine**", attachment: fs.createReadStream(tempPath) },
        threadID,
        () => fs.existsSync(tempPath) && fs.unlinkSync(tempPath)
      );
    } catch (err2) {
      return api.sendMessage("❌ Ahmad bhai, server down hai ya API fail ho gayi. Thodi der baad try karein.", threadID, messageID);
    }
  }
};
