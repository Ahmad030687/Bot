const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autoDownload",
  eventType: ["message_reply", "message"], // Har tarah ke message ko scan karega
  version: "90.0.0",
  credits: "Ahmad Ali Safdar",
  description: "Automatic Video Downloader for Events"
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // 🦅 RDX ULTRA REGEX - Is se koi link bach kar nahi jayega
  const regex = /https?:\/\/(?:www\.|m\.|web\.|v\.|fb\.)?(?:facebook\.com|fb\.watch|instagram\.com|tiktok\.com|reels|share|fb\.gg)\/\S+/ig;

  if (regex.test(body)) {
    const link = body.match(regex)[0];
    
    // Animation: React ⏳ to show bot caught the link
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // 🚀 Engine 1: Ryzendesu (Best for Share Links)
      let videoUrl = null;
      let title = "RDX Video";

      try {
        const platform = link.includes("instagram") ? "igdown" : "fbdown";
        const res = await axios.get(`https://api.ryzendesu.vip/api/downloader/${platform}?url=${encodeURIComponent(link)}`);
        videoUrl = res.data?.data?.[0]?.url || res.data?.url;
      } catch (e) {
        // 🚀 Engine 2: Koja (Backup)
        const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(link)}&apikey=Koja`);
        videoUrl = res.data.result?.url || res.data.url;
      }

      if (!videoUrl) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return;
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `rdx_event_${Date.now()}.mp4`);

      // Download Stream
      const videoResponse = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      videoResponse.data.pipe(writer);

      writer.on('finish', () => {
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (stats.size > 48 * 1024 * 1024) {
          api.sendMessage(`⚠️ **Size Limit!** (${sizeMB}MB)\nVideo bari hai, link check karein: ${videoUrl}`, threadID, () => fs.unlinkSync(filePath), messageID);
          return;
        }

        api.sendMessage({
          body: `🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅\n━━━━━━━━━━━━━━━━━\n📥 **Auto Downloaded!**\n📦 **Size:** ${sizeMB} MB\n━━━━━━━━━━━━━━━━━\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.setMessageReaction("✅", messageID, () => {}, true);
        }, messageID);
      });

    } catch (error) {
      console.log("[ RDX-EVENT ERROR ]", error.message);
    }
  }
};
