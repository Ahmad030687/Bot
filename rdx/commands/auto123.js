const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "21.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Base64 Fixed Downloader",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];
  if (!link) return api.sendMessage("❌ Link dein.", threadID, messageID);

  const API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;
  api.sendMessage("⏳ Fetching...", threadID, messageID);

  try {
    const res = await axios.get(API);
    const data = res.data;

    if (!data.status) return api.sendMessage("❌ Link invalid hai.", threadID, messageID);

    const filePath = path.join(__dirname, "cache", `rdx_${Date.now()}.mp4`);
    
    // Download
    const stream = await axios({
        url: data.url, // Base64 wala proxy link
        method: "GET",
        responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    stream.data.pipe(writer);

    writer.on('finish', () => {
        // Size Check (Important)
        if (fs.statSync(filePath).size < 2000) { 
             return api.sendMessage("❌ Video download fail (Empty File).", threadID, messageID);
        }
        api.sendMessage({
            body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**\n📝 ${data.title}`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (e) {
    api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
  }
};
