const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "2.0.0",
  credits: "AHMAD RDX",
  description: "AI Generative Name DP (Real AI Magic)",
  commandCategory: "Media",
  usages: "[Name] - Reply to an image",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("⚠️ **AHMAD RDX:** Kisi photo par reply karein aur apna Name likhein!", threadID, messageID);
  }

  const name = args.join(" ") || "AHMAD RDX";
  const originalImageUrl = messageReply.attachments[0].url;
  const cachePath = path.join(__dirname, "cache", `ai_magic_${Date.now()}.png`);

  api.sendMessage("✨ **AHMAD CREATIONS:** AI is re-imagining your photo... Please wait! 🔥", threadID);

  try {
    // 🦅 YE HAI ASLI AI MAGIC PROMPT
    // Hum AI ko keh rahe hain ke original photo ki vibe rakhe aur name 3D mein likhe
    const prompt = `A professional 3D aesthetic name art. The background and person should be inspired by this image: ${originalImageUrl}. The name "${name}" should be written in big, glowing, stylish 3D gold lettering at the bottom center. High resolution, 8k, cinematic lighting, realistic textures, masterpiece.`;

    // Hum Flux/SDXL engine use kar rahe hain jo text ke liye best hai
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    const response = await axios({
      url: apiUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(cachePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `🔥 **AHMAD RDX AI MAGIC**\n\n✨ **Style:** 3D Generative Art\n👤 **Name:** ${name}\n\nAb aya na asli mazza? 😉`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ AI Server busy hai, thori der baad try karein!", threadID, messageID);
  }
};
