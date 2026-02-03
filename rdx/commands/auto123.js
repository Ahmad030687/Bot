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
  version: "4.5.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AHMAD RDX Bypass Downloader",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage("⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Bypassing Security & Downloading...", threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    let data = res.data;
    if (typeof data === "string") try { data = JSON.parse(data); } catch (e) {}

    if (data && data.status && data.url) {
      const videoUrl = data.url;
      const title = data.title || "No Title";
      const filePath = path.join(__dirname, `/cache/ahmad_rdx_${Date.now()}.mp4`);

      // 🛡️ Bypass Headers: Ye TikTok 403 error ko khatam karega
      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Referer': 'https://www.tiktok.com/' // TikTok bypass ke liye lazmi hai
        }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n━━━━━━━━━━━━━━━━━━\n📝 **𝐓𝐢𝐭𝐥𝐞:** ${title}\n👤 **𝐃𝐞𝐬𝐢𝐠𝐧𝐞𝐝 𝐛𝐲:** Ahmad Ali\n⚡ **𝐒𝐭𝐚𝐭𝐮𝐬:** Success via Python\n━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

    } else {
      api.sendMessage("❌ API Error: Link private ho sakta hai.", threadID, messageID);
    }
  } catch (error) {
    // Detail error message taake pata chale kahan masla hai
    const errorMsg = error.response ? `Status: ${error.response.status}` : error.message;
    api.sendMessage(`❌ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐄𝐫𝐫𝐨𝐫:** ${errorMsg}`, threadID, messageID);
  }
};
