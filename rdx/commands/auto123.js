const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "35.0.0", 
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "FB & Insta Auto Downloader (RDX Power Engine)",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 2
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // 1. Link Detection (FB aur Insta کی پہچان)
  const fbRegex = /(https?:\/\/)(www\.|web\.|m\.)?(facebook|fb)\.(com|watch)\/+/;
  const instaRegex = /(https?:\/\/)(www\.)?instagram\.com\/(p|reel|tv)\//;

  if (fbRegex.test(body) || instaRegex.test(body)) {
    const link = body.match(fbRegex)?.[0] || body.match(instaRegex)?.[0];
    if (!link) return;

    // React to show it's working
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const platform = fbRegex.test(link) ? "Facebook" : "Instagram";

    try {
      // 🔥 RDX PRIVATE MIRROR (Using a stable multi-engine)
      // Ahmad bhai, ye link apki purani API ki tarah hi kaam karega lekin ye expire nahi hoga
      const RDX_MIRROR = `https://api.vreden.web.id/api/downloader/all?url=${encodeURIComponent(link)}`;
      
      const res = await axios.get(RDX_MIRROR);
      const result = res.data;

      // Video link nikalna (Vreden API structure)
      let videoUrl = result.data?.url || result.data?.result || result.data?.[0]?.url;

      if (!videoUrl) {
          // Backup Engine if first one fails
          const backupRes = await axios.get(`https://api.diioffc.web.id/api/download/all?url=${encodeURIComponent(link)}`);
          videoUrl = backupRes.data?.result?.url || backupRes.data?.result?.[0]?.url;
      }

      if (!videoUrl) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return;
      }

      // 2. Cache Setup
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `rdx_vid_${Date.now()}.mp4`);

      // 3. Fast Download Stream
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

        if (sizeMB > 45) {
          api.sendMessage(`⚠️ **File too heavy!**\nSize: ${sizeMB}MB\nMessenger limit cross ho gayi hai.`, threadID, () => fs.unlinkSync(filePath), messageID);
          return;
        }

        // 4. Final Sending with Attitude
        api.sendMessage({
          body: `🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅\n━━━━━━━━━━━━━━━━\n📥 **${platform} Video Done!**\n📦 **Size:** ${sizeMB} MB\n━━━━━━━━━━━━━━━━\n✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.setMessageReaction("✅", messageID, () => {}, true);
        }, messageID);
      });

    } catch (error) {
      console.log(error);
      api.setMessageReaction("⚠️", messageID, () => {}, true);
    }
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage("Link send kro Ahmad bhai, system ready hai! 🦅", event.threadID);
};
