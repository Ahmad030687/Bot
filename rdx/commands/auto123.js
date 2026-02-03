const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "16.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 Universal Downloader (Bypass Fix)",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  const API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;
  api.sendMessage("⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** Downloading & Bypassing...", threadID, messageID);

  try {
    const res = await axios.get(API, { timeout: 60000 });
    const data = res.data;

    if (!data || !data.status || !data.url) {
      return api.sendMessage("❌ Video link nahi mila, link refresh karein.", threadID, messageID);
    }

    // Cache setup
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

    // 📥 Direct Download (Sab Platforms ke liye aik hi system)
    const response = await axios({
      url: data.url,
      method: "GET",
      responseType: "stream",
      timeout: 300000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      // 🛡️ CRITICAL CHECK: Attachment error se bachne ke liye
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return api.sendMessage("❌ Error: File khali (0 bytes) download hui.", threadID, messageID);
      }

      const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
      if (sizeMB > 25) {
        const directLink = data.url;
        api.sendMessage(`⚠️ Size (${sizeMB.toFixed(1)}MB) limit se bara hai.\n🔗 Link: ${directLink}`, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
        return;
      }

      // ✅ Final Message
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**\n━━━━━━━━━━━━━━\n📝 ${data.title}\n⚡ Status: Success`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);
    });

    writer.on("error", (e) => {
      api.sendMessage(`❌ Disk Error: ${e.message}`, threadID, messageID);
    });

  } catch (err) {
    api.sendMessage(`❌ Connection Error: ${err.message}`, threadID, messageID);
  }
};
