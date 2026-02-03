const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "25.0.0", // King Version
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Download FB/IG/TikTok (Universal Fix)",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  // 🛡️ Platform Identification (Sirf display ke liye)
  let platform = "Video";
  if (link.includes("facebook") || link.includes("fb.watch")) platform = "Facebook 🟦";
  else if (link.includes("instagram")) platform = "Instagram 📸";
  else if (link.includes("tiktok")) platform = "TikTok 🎵";

  // 🔗 Aapki Working API
  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage(`⏳ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗** - Fetching ${platform}...`, threadID, messageID);

  try {
    // 1. API Call
    const res = await axios.get(RDX_API);
    const data = res.data;

    if (!data.status || !data.url) {
      return api.sendMessage("❌ Error: Link expire ho gaya hai ya private hai.", threadID, messageID);
    }

    // 2. Cache Setup
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

    // 3. Stream Download (Wohi logic jo tiktok.js mein chali)
    const videoResponse = await axios({
      method: 'GET',
      url: data.url, // Ye Proxy URL hai
      responseType: 'stream',
      timeout: 120000 // 2 Minutes timeout
    });

    const writer = fs.createWriteStream(filePath);
    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      // 🛡️ SAFETY CHECK 1: File Download hui ya nahi? (Empty/404 check)
      // Agar file 2KB se choti hai, matlab video nahi balkay koi Error text download hua hai
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 2000) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return api.sendMessage("❌ Download Failed: Video file khali hai (404 Error).", threadID, messageID);
      }

      // 🛡️ SAFETY CHECK 2: Messenger Limit (25MB)
      const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
      if (sizeMB > 25) {
        api.sendMessage(`⚠️ Video size (${sizeMB.toFixed(2)}MB) Messenger limit se bara hai.\n🔗 Direct Link: ${data.url}`, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
        return;
      }

      // ✅ SUCCESS: Send Video
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐋𝐓𝐑𝐀-𝐃𝐋**\n━━━━━━━━━━━━━━━━━━\n📌 **Platform:** ${platform}\n📝 **Title:** ${data.title || "Social Video"}\n👤 **Owner:** Ahmad Ali\n━━━━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        // Cleanup
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);
    });

    writer.on('error', (err) => {
        api.sendMessage(`❌ Disk Writing Error: ${err.message}`, threadID, messageID);
    });

  } catch (error) {
    const errorMsg = error.response ? `Status: ${error.response.status}` : error.message;
    api.sendMessage(`❌ Connection Failed: ${errorMsg}\n(Check Python API Logs)`, threadID, messageID);
  }
};
