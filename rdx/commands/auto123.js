/**
 * fb.js - AHMAD RDX UNIVERSAL DOWNLOADER (99% Stable)
 * Supports: Facebook | Instagram | TikTok
 * TikTok: Direct Proxy Link (NO server download)
 * FB / IG: Auto Download + Attach
 * Credits: Ahmad Ali Safdar
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "17.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 Universal Downloader (Crash-Free)",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link)
    return api.sendMessage("❌ Ahmad bhai link to dein.", threadID, messageID);

  const API =
    "https://ahmad-rdx-api.onrender.com/ahmad-dl?url=" +
    encodeURIComponent(link);

  api.sendMessage(
    "⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** Downloading...",
    threadID,
    messageID
  );

  try {
    const res = await axios.get(API, { timeout: 60000 });
    const data = res.data;

    if (!data || !data.status || !data.url) {
      return api.sendMessage(
        "❌ Video extract nahi ho saka.",
        threadID,
        messageID
      );
    }

    /* ================== TIKTOK (PROXY MODE) ================== */
    if (data.is_proxy) {
      return api.sendMessage(
        `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**\n━━━━━━━━━━━━━━\n🎵 TikTok Video\n📝 ${data.title}\n\n🔗 Download Link:\n${data.url}`,
        threadID,
        messageID
      );
    }

    /* ================== FB / IG (DOWNLOAD MODE) ================== */
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

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
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return api.sendMessage(
          "❌ Download failed (empty file).",
          threadID,
          messageID
        );
      }

      const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
      if (sizeMB > 25) {
        fs.unlinkSync(filePath);
        return api.sendMessage(
          `⚠️ Video bari hai (${sizeMB.toFixed(
            1
          )}MB)\n🔗 Direct Link:\n${data.url}`,
          threadID,
          messageID
        );
      }

      api.sendMessage(
        {
          body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**\n━━━━━━━━━━━━━━\n📝 ${data.title}\n⚡ Status: Success`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        messageID
      );
    });

    writer.on("error", () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      api.sendMessage("❌ File write error.", threadID, messageID);
    });
  } catch (err) {
    api.sendMessage(
      `❌ API Error: ${err.message}`,
      threadID,
      messageID
    );
  }
};
