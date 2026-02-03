const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "30.0.0", // Verified Engine
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Universal Downloader (Same as TikTok)",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  // 1. Platform Detection (Sirf Message ke liye)
  let platform = "Media";
  if (link.includes("facebook") || link.includes("fb.watch")) platform = "Facebook";
  else if (link.includes("instagram")) platform = "Instagram";
  else if (link.includes("tiktok")) platform = "TikTok";

  // 2. Wohi API Logic jo TikTok command mein chal rahi hai
  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage(`⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Fetching ${platform} Video...`, threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    const data = res.data;

    if (!data.status || !data.url) {
      return api.sendMessage("❌ Link expire hai ya Private video hai.", threadID, messageID);
    }

    // 3. Cache Folder Setup
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    // Har file ka naam alag hoga taake mix na ho
    const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

    // 4. Download Stream (TikTok command wala same code)
    const videoResponse = await axios({
      method: 'GET',
      url: data.url,
      responseType: 'stream',
      timeout: 120000 // 2 Minutes timeout
    });

    const writer = fs.createWriteStream(filePath);
    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      // 🛡️ Empty Check
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 2000) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return api.sendMessage("❌ Error: Download fail (Empty File).", threadID, messageID);
      }

      // 🛡️ Size Check (25MB)
      const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
      if (sizeMB > 25) {
        api.sendMessage(`⚠️ Video (${sizeMB.toFixed(2)}MB) Messenger limit se bari hai.\n🔗 Link: ${data.url}`, threadID, () => {
           if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
        return;
      }

      // 5. Send Video
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**\n📌 **Platform:** ${platform}\n📝 **Title:** ${data.title || "Video"}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        // Delete after send
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);
    });

    writer.on('error', (err) => {
        api.sendMessage(`❌ File Error: ${err.message}`, threadID, messageID);
    });

  } catch (error) {
    api.sendMessage(`❌ Server Error: ${error.message}`, threadID, messageID);
  }
};
