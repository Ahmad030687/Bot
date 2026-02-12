const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "70.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Auto Downloader - Supports Share Links",
  commandCategory: "No Prefix",
  usages: "Bas link send karein",
  cooldowns: 2
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // 🦅 RDX ULTRA REGEX (Har tarah ke share aur reel links ke liye)
  const regex = /(https?:\/\/(?:www\.|m\.|web\.|fb\.)?(?:facebook\.com|fb\.watch|instagram\.com|tiktok\.com|vt\.tiktok\.com)\/\S+)/ig;
  
  const match = body.match(regex);
  if (match) {
    const link = match[0];
    
    // Animation: Reaction ⏳
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // 🚀 Using Koja API as Primary
      const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(link)}&apikey=Koja`);
      
      let videoUrl = res.data.result?.url || res.data.url || res.data.data?.main_url;

      // 🛡️ Fallback: Agar Koja link na de, to dusri API try karein
      if (!videoUrl) {
        const backup = await axios.get(`https://api.vreden.web.id/api/downloader/all?url=${encodeURIComponent(link)}`);
        videoUrl = backup.data.data?.url || backup.data.result;
      }

      if (!videoUrl) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return;
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `rdx_vid_${Date.now()}.mp4`);

      const videoResponse = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream',
        timeout: 120000 
      });

      const writer = fs.createWriteStream(filePath);
      videoResponse.data.pipe(writer);

      writer.on('finish', () => {
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (stats.size > 48 * 1024 * 1024) { // Messenger limits
             api.sendMessage(`⚠️ **Too Large!** (${sizeMB}MB)\nLink se download karein: ${videoUrl}`, threadID, () => fs.unlinkSync(filePath), messageID);
             return;
        }

        api.sendMessage({
          body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌** 🦅\n━━━━━━━━━━━━━━━━━\n📥 **Video Downloaded!**\n📦 **Size:** ${sizeMB} MB\n━━━━━━━━━━━━━━━━━\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.setMessageReaction("✅", messageID, () => {}, true);
        }, messageID);
      });

    } catch (e) {
      console.log("AUTO DL ERROR:", e.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage("Ahmad bhai, system active hai! Bas link pheinkein. 🦅", event.threadID);
};
