/**
 * image.js - Gemini Brain + Pollinations PRO Artist
 * Credits: Ahmad Ali Safdar | 2026 Stable
 */

module.exports.config = {
  name: "image",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Pro Image Generation using Pollinations AI & Gemini",
  commandCategory: "graphics",
  usages: "image [prompt]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const userPrompt = args.join(" ");
  if (!userPrompt) return api.sendMessage("⚠️ Ahmad bhai, kuch likhein jo AI banaye!", threadID, messageID);

  const GEMINI_KEY = "AIzaSyC5IsvCSC-p5MFbhwQQZ7h-aYvCMlAuU3Q";
  const POLLIN_KEY = "sk_SGvmco1IBlYC16NW2SJKcmDDKzUMvTdX"; // Aapki New PRO Key
  const tempPath = path.join(__dirname, `/cache/rdx_pro_${Date.now()}.png`);

  api.sendMessage("🎨 **𝐀𝐇𝐌𝐀𝐃 𝐁𝐎𝐒𝐒 - 𝐏𝐑𝐎 𝐄𝐃𝐈𝐓𝐈𝐎𝐍 𝐓𝐘𝐀𝐑 𝐊𝐑 𝐑𝐇𝐀 𝐇𝐀𝐈...**", threadID, messageID);

  try {
    // --- STEP 1: Gemini Brain (Prompt Enhancing) ---
    const geminiRes = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      contents: [{ parts: [{ text: `Act as a professional prompt engineer. Expand this into a cinematic, hyper-realistic, 8k image prompt: ${userPrompt}. Output only the new prompt.` }] }]
    });

    const proPrompt = geminiRes.data.candidates[0].content.parts[0].text || userPrompt;

    // --- STEP 2: Pollinations PRO Engine ---
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(proPrompt)}?width=1024&height=1024&model=flux-pro&seed=${Math.floor(Math.random() * 1000000)}`;

    const response = await axios({
      url: imageUrl,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${POLLIN_KEY}` }, // PRO Authentication
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(tempPath, Buffer.from(response.data, 'binary'));

    return api.sendMessage({
      body: `🦅 **SARDAR RDX PRO STUDIO**\n✨ **Prompt:** ${userPrompt}\n💎 **Status:** PRO Active (No Limits)`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Error: PRO Key ya server mein masla hai.", threadID, messageID);
  }
};
