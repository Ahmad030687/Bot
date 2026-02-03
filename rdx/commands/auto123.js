const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "9.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AHMAD RDX Ultimate Fix",
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
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      const response = await axios({
        method: 'get',
        url: data.url,
        responseType: 'stream',
        timeout: 300000 // 5 Minutes
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
          return api.sendMessage("❌ Error: API ne khali file bheji hai.", threadID, messageID);
        }

        const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
        if (sizeMB > 25) {
          api.sendMessage(`⚠️ Size (${sizeMB.toFixed(2)}MB) Messenger limit se bara hai.\n🔗 Direct Link: ${data.url}`, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }, messageID);
          return;
        }

        api.sendMessage({
          body: `📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n━━━━━━━━━━━━━━━━━━\n📝 **𝐓𝐢𝐭𝐥𝐞:** ${data.title}\n👤 **𝐃𝐞𝐬𝐢𝐠𝐧𝐞𝐝 𝐛𝐲:** Ahmad Ali\n⚡ **𝐒𝐭𝐚𝐭𝐮𝐬:** Success via Proxy\n━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

      writer.on('error', (e) => api.sendMessage(`❌ Disk Error: ${e.message}`, threadID, messageID));

    } else {
      api.sendMessage(`❌ API Error: ${data.error || "Video link nahi mila."}`, threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`❌ API Connection Failed! Tasalli karein ke Python API Live hai.`, threadID, messageID);
  }
};
