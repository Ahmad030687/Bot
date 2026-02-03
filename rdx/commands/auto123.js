const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "15.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 Universal Downloader (FB / IG / TikTok)",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link)
    return api.sendMessage("❌ Ahmad bhai, video link to dein.", threadID, messageID);

  const API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage("⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** Downloading video...", threadID, messageID);

  try {
    const res = await axios.get(API, { timeout: 60000 });
    const data = res.data;

    if (!data || !data.status || !data.url) {
      return api.sendMessage("❌ Video extract nahi ho saki.", threadID, messageID);
    }

    /* ================= TIKTOK (PROXY STREAM) ================= */
    if (data.is_proxy === true) {
      return api.sendMessage({
        body: `🎵 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - TikTok**\n━━━━━━━━━━━━━━\n📝 ${data.title || "TikTok Video"}`,
        attachment: await global.utils.getStreamFromURL(data.url)
      }, threadID, messageID);
    }

    /* ================= FB / IG (DIRECT DOWNLOAD) ================= */
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

    const videoStream = await axios({
      url: data.url,
      method: "GET",
      responseType: "stream",
      timeout: 200000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": link
      }
    });

    const writer = fs.createWriteStream(filePath);
    videoStream.data.pipe(writer);

    writer.on("finish", () => {
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return api.sendMessage("❌ Video empty aa gayi.", threadID, messageID);
      }

      const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
      if (sizeMB > 25) {
        fs.unlinkSync(filePath);
        return api.sendMessage(
          `⚠️ Video size ${sizeMB.toFixed(1)}MB hai\n🔗 ${data.url}`,
          threadID,
          messageID
        );
      }

      api.sendMessage({
        body:
`🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**
━━━━━━━━━━━━━━
📝 ${data.title || "Social Video"}
⚡ Status: Success`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (err) {
    api.sendMessage("❌ Server busy hai, thori dair baad try karein.", threadID, messageID);
  }
};
