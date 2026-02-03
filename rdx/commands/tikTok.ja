/**
 * tiktok.js - AHMAD RDX Custom API Version
 * Credits: Ahmad Ali Safdar | Sardar RDX
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "tiktok",
  version: "3.0.0", // New Version
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download TikTok via RDX Custom Engine",
  commandCategory: "media",
  usages: "#tiktok [video_url]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) {
    return api.sendMessage("⚠️ Ahmad bhai, TikTok video ka link to dein!\nUsage: #tiktok [link]", threadID, messageID);
  }

  // 🛠️ Using Your Own Render API
  // Note: encodeURIComponent zaroori hai taake link toote nahi
  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage("📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Fetching via Python Engine...**", threadID, messageID);

  try {
    // 1. Apni API ko call karna
    const response = await axios.get(RDX_API);
    const data = response.data;

    // console.log(data); // Debugging ke liye

    if (!data.status || !data.url) {
      return api.sendMessage("❌ Error: API ne link grab nahi kiya. Link check karein.", threadID, messageID);
    }

    const videoUrl = data.url; // Ye ab Proxy URL hoga (Safe)
    const title = data.title || "TikTok Video";

    // 2. Video Stream Download karna
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const filePath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoResponse = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 120000 // 2 Minutes timeout for big files
    });

    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      // 🛡️ CRITICAL CHECK: File empty to nahi?
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 2000) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return api.sendMessage("❌ Error: Download fail (404/Empty File).", threadID, messageID);
      }

      // 🛡️ SIZE CHECK: Messenger Limit (25MB)
      const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
      if (sizeMB > 25) {
         api.sendMessage(`⚠️ Video bohot bari hai (${sizeMB.toFixed(2)}MB).\n🔗 Direct Link: ${videoUrl}`, threadID, () => {
           fs.unlinkSync(filePath);
         }, messageID);
         return;
      }

      // 3. Video Send karna
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐓𝐈𝐊𝐓𝐎𝐊**\n✨ ${title}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on('error', (err) => {
        api.sendMessage(`❌ Disk Error: ${err.message}`, threadID, messageID);
    });

  } catch (error) {
    // console.error(error);
    const errorMsg = error.response ? `Status ${error.response.status}` : error.message;
    api.sendMessage(`❌ API Error: ${errorMsg}\n(Render Server check karein)`, threadID, messageID);
  }
};
