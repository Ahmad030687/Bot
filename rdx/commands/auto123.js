const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AHMAD RDX Ultimate Bypass Fix",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage("⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Downloading & Bypassing Security...", threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    const data = res.data;

    if (data && data.status && data.url) {
      // 📂 Cache Folder Setup
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      // 📥 Video Stream Download
      const response = await axios({
        method: 'get',
        url: data.url,
        responseType: 'stream',
        timeout: 120000 // 2 Minutes
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        // 🛡️ Critical Check: Kya file waqayi bani?
        if (!fs.existsSync(filePath)) {
          return api.sendMessage("❌ Error: File save nahi ho saki!", threadID, messageID);
        }

        const stats = fs.statSync(filePath);
        const sizeMB = stats.size / (1024 * 1024);
        console.log(`[AHMAD RDX] File Downloaded: ${filePath} | Size: ${sizeMB.toFixed(2)}MB`);

        // ❌ Agar file khali hai (0 bytes)
        if (stats.size === 0) {
          fs.unlinkSync(filePath);
          return api.sendMessage("❌ Error: Video file khali (0 bytes) download hui.", threadID, messageID);
        }

        // ⚠️ Messenger Limit Check (25MB)
        if (sizeMB > 25) {
          api.sendMessage(`⚠️ Size (${sizeMB.toFixed(2)}MB) zyada hai. Direct link se download karein:\n🔗 ${data.url}`, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }, messageID);
          return;
        }

        // ✅ Final Send Logic
        try {
          return api.sendMessage({
            body: `📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n━━━━━━━━━━━━━━━━━━\n📝 **𝐓𝐢𝐭𝐥𝐞:** ${data.title}\n👤 **𝐃𝐞𝐬𝐢𝐠𝐧𝐞𝐝 𝐛𝐲:** Ahmad Ali\n⚡ **𝐒𝐭𝐚𝐭𝐮𝐬:** Success via Proxy\n━━━━━━━━━━━━━━━━━━`,
            attachment: fs.createReadStream(filePath)
          }, threadID, (err) => {
            if (err) console.error("[FCA ERROR]", err);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }, messageID);
        } catch (sendError) {
          api.sendMessage("❌ Bot Attachment error! File format sahi nahi hai.", threadID, messageID);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });

      writer.on('error', (e) => api.sendMessage(`❌ Disk Error: ${e.message}`, threadID, messageID));

    } else {
      api.sendMessage("❌ API ne link nahi diya ya TikTok private hai.", threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`❌ API Connection Failed: ${error.message}`, threadID, messageID);
  }
};
