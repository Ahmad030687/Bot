/**
 * image.js - Gemini Brain + Stable Art Engine
 * Credits: Ahmad Ali Safdar
 */

module.exports.config = {
  name: "image",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AI Image Generation with Gemini Prompt Enhancer",
  commandCategory: "graphics",
  usages: "image [prompt]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const userPrompt = args.join(" ");
  if (!userPrompt) return api.sendMessage("⚠️ Ahmad bhai, kuch likhein to sahi! (e.g. #image a tiger in suit)", threadID, messageID);

  const API_KEY = "AIzaSyC5IsvCSC-p5MFbhwQQZ7h-aYvCMlAuU3Q";
  const tempPath = path.join(__dirname, `/cache/rdx_art_${Date.now()}.png`);

  api.sendMessage("🎨 **𝐀𝐇𝐌𝐀𝐃 𝐁𝐎𝐒𝐒 𝐓𝐘𝐀𝐑 𝐊𝐑 𝐑𝐇𝐀 𝐇𝐀𝐈...**", threadID, messageID);

  try {
    // --- STEP 1: Gemini Se Prompt Behtar Karwana ---
    const geminiRes = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      contents: [{ parts: [{ text: `Expand this image prompt for high-quality AI generation, be descriptive and cinematic. Output ONLY the expanded prompt in English: ${userPrompt}` }] }]
    });

    const enhancedPrompt = geminiRes.data.candidates[0].content.parts[0].text || userPrompt;
    console.log("Enhanced Prompt:", enhancedPrompt);

    // --- STEP 2: Stable Art Engine (Flux/Pollinations) ---
    // Ye engine kabhi 403 error nahi deta
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&model=flux`;

    const imgData = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(tempPath, Buffer.from(imgData, 'binary'));

    return api.sendMessage({
      body: `🦅 **SARDAR RDX AI STUDIO**\n✨ **Original:** ${userPrompt}\n🧠 **AI Brain:** Gemini 1.5 Pro\n🎨 **Artist:** Flux Cinematic`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (e) {
    console.error(e);
    // Absolute Fallback (Direct Image)
    try {
        const fallbackUrl = `https://api.samir.site/gen/flux?prompt=${encodeURIComponent(userPrompt)}`;
        const fbData = (await axios.get(fallbackUrl, { responseType: 'arraybuffer' })).data;
        fs.writeFileSync(tempPath, Buffer.from(fbData, 'binary'));
        return api.sendMessage({ body: "🦅 **𝐀𝐇𝐌𝐀𝐃  RDX (Fallback Engine)**", attachment: fs.createReadStream(tempPath)}, threadID, () => fs.unlinkSync(tempPath));
    } catch (err) {
        return api.sendMessage("❌ Ahmad bhai, server down hai. Thori der baad try karein.", threadID, messageID);
    }
  }
};
