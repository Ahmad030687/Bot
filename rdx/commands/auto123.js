const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AHMAD RDX Final Downloader",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  let platform = link.includes("tiktok") ? "TikTok" : link.includes("instagram") ? "Instagram" : "Facebook";
  let logo = platform == "TikTok" ? "🎵" : platform == "Instagram" ? "📸" : "🟦";

  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage(`⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Fetching ${platform} Video...`, threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    const data = res.data;

    if (data && data.status && data.url) {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

      const response = await axios({
        method: 'get', url: data.url, responseType: 'stream', timeout: 300000 
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        const stats = fs.statSync(filePath);
        const sizeMB = stats.size / (1024 * 1024);

        if (sizeMB > 25 || sizeMB == 0) {
          api.sendMessage(`⚠️ Video size (${sizeMB.toFixed(2)}MB) Messenger limit se bari hai.\n🔗 Link: ${data.url}`, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }, messageID);
          return;
        }

        api.sendMessage({
          body: `📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n━━━━━━━━━━━━━━━━━━\n🌐 **𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦:** ${logo} ${platform}\n📝 **𝐓𝐢𝐭𝐥𝐞:** ${data.title}\n👤 **𝐃𝐞𝐬𝐢𝐠𝐧𝐞𝐝 𝐛𝐲:** Ahmad Ali\n⚡ **𝐒𝐭𝐚𝐭𝐮𝐬:** 1080p Ultra Bypass\n━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

      writer.on('error', (e) => api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID));
    } else {
      api.sendMessage("❌ API ne response nahi diya. Link refresh karein.", threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`❌ Connection Failed: ${error.message}`, threadID, messageID);
  }
};
