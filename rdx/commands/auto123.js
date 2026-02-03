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
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AHMAD RDX Smart Multi-Downloader",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  // 🛡️ Platform Detection Logic
  let platformName = "Universal";
  let platformLogo = "🌐";

  if (link.includes("facebook.com") || link.includes("fb.watch") || link.includes("fb.com")) {
    platformName = "Facebook";
    platformLogo = "🟦";
  } else if (link.includes("instagram.com")) {
    platformName = "Instagram";
    platformLogo = "📸";
  } else if (link.includes("tiktok.com")) {
    platformName = "TikTok";
    platformLogo = "🎵";
  } else if (link.includes("youtube.com") || link.includes("youtu.be")) {
    platformName = "YouTube";
    platformLogo = "🟥";
  }

  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage(`⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Detecting ${platformName} Link...`, threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    let data = res.data;
    if (typeof data === "string") try { data = JSON.parse(data); } catch (e) {}

    if (data && data.status && data.url) {
      const videoUrl = data.url;
      const title = data.title || "No Title Provided";
      const filePath = path.join(__dirname, `/cache/ahmad_rdx_${Date.now()}.mp4`);

      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        // 🦅 AHMAD RDX: Professional Multi-Platform Branding
        api.sendMessage({
          body: `📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `🌐 **𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦:** ${platformLogo} ${platformName}\n` +
                `📝 **𝐓𝐢𝐭𝐥𝐞:** ${title}\n` +
                `👤 **𝐃𝐞𝐬𝐢𝐠𝐧𝐞𝐝 𝐛𝐲:** Ahmad Ali\n` +
                `⚡ **𝐒𝐭𝐚𝐭𝐮𝐬:** 1080p HD Quality\n` +
                `━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

    } else {
      api.sendMessage("❌ API ne response nahi diya. Link check karein!", threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`❌ Connection Error: ${error.message}`, threadID, messageID);
  }
};
