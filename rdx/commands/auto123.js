const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "20.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Final Fix Downloader",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];
  if (!link) return api.sendMessage("❌ Link dein Ahmad bhai.", threadID, messageID);

  const API_URL = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;
  
  api.sendMessage("⏳ Fetching video...", threadID, messageID);

  try {
    const res = await axios.get(API_URL);
    const data = res.data;

    if (!data.status) return api.sendMessage("❌ API Error: Link nahi mila.", threadID, messageID);

    const filePath = path.join(__dirname, "cache", `rdx_${Date.now()}.mp4`);
    
    // Download logic
    const videoStream = await axios({
      method: 'GET',
      url: data.url, // Ye ab encoded proxy URL hai
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    videoStream.data.pipe(writer);

    writer.on('finish', () => {
      if (fs.statSync(filePath).size < 1000) { // Agar file 1KB se choti hai matlab error hai
         return api.sendMessage("❌ Video download fail (404/403).", threadID, messageID);
      }
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**\n━━━━━━━━━━━━\n📝 ${data.title}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (e) {
    api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
  }
};
