const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "AHMAD RDX Zero-Error Downloader",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;
  api.sendMessage("⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Bypassing & Downloading Video...", threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    const data = res.data;

    if (data && data.status && data.url) {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

      // 📥 Video ko server se download karna
      const response = await axios({
        method: 'get',
        url: data.url,
        responseType: 'stream',
        timeout: 200000 // 3 minutes wait for big videos
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        // 🛡️ CRITICAL CHECK: File bani aur size 0 toh nahi?
        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return api.sendMessage("❌ Error: Video file download nahi ho saki (Empty File).", threadID, messageID);
        }

        const stats = fs.statSync(filePath);
        const sizeMB = stats.size / (1024 * 1024);

        if (sizeMB > 25) {
          api.sendMessage(`⚠️ Size (${sizeMB.toFixed(2)}MB) Messenger limit se bari hai.\n🔗 Link: ${data.url}`, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }, messageID);
          return;
        }

        // ✅ FINAL ATTACHMENT SEND
        api.sendMessage({
          body: `📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n━━━━━━━━━━━━━━━━━━\n📝 **𝐓𝐢𝐭𝐥𝐞:** ${data.title}\n👤 **𝐃𝐞𝐬𝐢𝐠𝐧𝐞𝐝 𝐛𝐲:** Ahmad Ali\n⚡ **𝐒𝐭𝐚𝐭𝐮𝐬:** Success via Python\n━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(filePath)
        }, threadID, (err) => {
          if (err) console.error("FCA Upload Error:", err);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

    } else {
      api.sendMessage("❌ API Error: Video link nahi mila.", threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`❌ Connection Failed: ${error.message}`, threadID, messageID);
  }
};
