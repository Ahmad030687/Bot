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
  name: "fb",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Universal Downloader via RDX Python",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  const RDX_API = `https://ahmad-rdx-api.onrender.com/rdx-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage("⏳ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Connecting to Python Engine...", threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    
    // 🛡️ Logic: Agar response string hai toh usay object mein badlo
    let data = res.data;
    if (typeof data === "string") {
        try { data = JSON.parse(data); } catch (e) { /* ignore */ }
    }

    if (data && (data.status === true || data.status === "true") && data.url) {
      const videoUrl = data.url;
      const title = data.title || "No Title";
      
      // Cache folder ka path (Ensure karein ke ye folder bot ke root mein ho)
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      
      const filePath = path.join(cacheDir, `rdx_vid_${Date.now()}.mp4`);

      api.sendMessage("📥 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Downloading file...", threadID, messageID);

      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' } // TikTok ke liye zaroori hai
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑**\n\n📝 Title: ${title}\n✅ Success: Python Engine`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

      writer.on('error', (err) => {
        api.sendMessage(`❌ Writing Error: ${err.message}`, threadID, messageID);
      });
    } else {
      // 📝 Debugging ke liye data log karein
      console.log("RDX API Response:", data);
      api.sendMessage("❌ API Error: Response format sahi nahi hai ya link private hai.", threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`❌ Connection Error: ${error.message}`, threadID, messageID);
  }
};
