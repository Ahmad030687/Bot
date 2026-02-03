const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

// Render ke liye Home Page taake 404 khatam ho jaye
app.get('/', (req, res) => {
  res.send('🦅 𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐁𝐎𝐓 is Active and Running!');
});

app.listen(port, () => {
  console.log(`[RDX] Health Check is live on port ${port}`);
});

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AHMAD RDX Ultra-Proxy Downloader (TikTok Fix)",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  // 🛡️ Platform Detection for Professional Look
  let platformName = "Universal";
  let platformLogo = "🌐";
  if (link.includes("facebook.com") || link.includes("fb.watch")) { platformName = "Facebook"; platformLogo = "🟦"; }
  else if (link.includes("instagram.com")) { platformName = "Instagram"; platformLogo = "📸"; }
  else if (link.includes("tiktok.com")) { platformName = "TikTok"; platformLogo = "🎵"; }
  else if (link.includes("youtube.com") || link.includes("youtu.be")) { platformName = "YouTube"; platformLogo = "🟥"; }

  // 🔗 Python API Endpoint
  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage(`⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Bypassing Security for ${platformName}...`, threadID, messageID);

  try {
    // 1. Python Server se Proxy URL lena
    const res = await axios.get(RDX_API);
    let data = res.data;
    if (typeof data === "string") try { data = JSON.parse(data); } catch (e) {}

    if (data && data.status && data.url) {
      const proxyUrl = data.url; // Ye ab aapka apna server link hai
      const title = data.title || "Social Media Video";
      
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const filePath = path.join(cacheDir, `ahmad_rdx_${Date.now()}.mp4`);

      // 2. Video Download via Proxy (Ab 403 error nahi aayega)
      const response = await axios({
        method: 'get',
        url: proxyUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        // 🦅 AHMAD RDX: Premium Branding
        api.sendMessage({
          body: `📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `🌐 **𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦:** ${platformLogo} ${platformName}\n` +
                `📝 **𝐓𝐢𝐭𝐥𝐞:** ${title}\n` +
                `👤 **𝐃𝐞𝐬𝐢𝐠𝐧𝐞𝐝 𝐛𝐲:** Ahmad Ali\n` +
                `⚡ **𝐒𝐭𝐚𝐭𝐮𝐬:** 1080p Ultra Bypass\n` +
                `━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

      writer.on('error', (err) => {
        api.sendMessage(`❌ Writing Error: ${err.message}`, threadID, messageID);
      });

    } else {
      api.sendMessage("❌ API Error: Video nahi mil saki. Link check karein.", threadID, messageID);
    }
  } catch (error) {
    const errorMsg = error.response ? `Status: ${error.response.status}` : error.message;
    api.sendMessage(`❌ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 Error:** ${errorMsg}`, threadID, messageID);
  }
};
