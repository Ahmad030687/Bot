const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "60.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Automatic Video Downloader with Animations",
  commandCategory: "No Prefix",
  usages: "Bas link send karein",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (!body) return;

  // 1. Link Detection (Automatic)
  const regex = /(https?:\/\/.*(?:tiktok|facebook|fb\.watch|instagram|reel)\.(?:com|net)\/\S+)/;
  
  if (regex.test(body)) {
    const link = body.match(regex)[0];

    // Animation 1: Reaction lagana (⏳)
    api.setMessageReaction("⏳", messageID, () => {}, true);

    // 🚀 Koja API Engine
    const KOJA_API = `https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(link)}&apikey=Koja`;

    try {
      const res = await axios.get(KOJA_API);
      const data = res.data;

      // API se video link nikalna (Koja API ke result format ke mutabiq)
      const videoUrl = data.result?.url || data.url || data.data?.main_url;

      if (!videoUrl) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return;
      }

      // 2. Cache Setup
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `rdx_auto_${Date.now()}.mp4`);

      // 3. Fast Download Stream
      const videoResponse = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream',
        timeout: 120000 
      });

      const writer = fs.createWriteStream(filePath);
      videoResponse.data.pipe(writer);

      writer.on('finish', () => {
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        // Messenger limit check (25MB)
        if (stats.size > 25 * 1024 * 1024) {
             api.sendMessage(`⚠️ **Video Too Large!**\nSize: ${sizeMB}MB\nMessenger limit se bari hai, link se download karein:\n🔗 ${videoUrl}`, threadID, () => {
               if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
             }, messageID);
             api.setMessageReaction("⚠️", messageID, () => {}, true);
             return;
        }

        // Animation 2: Success Reaction (✅) aur Stylish Header ke sath bhejwana
        api.setMessageReaction("✅", messageID, () => {}, true);

        api.sendMessage({
          body: `🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅\n━━━━━━━━━━━━━━━━━\n📥 **Media Downloaded Successfully**\n📦 **Size:** ${sizeMB} MB\n✨ **Platform:** Auto Detected\n━━━━━━━━━━━━━━━━━\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          // File delete karna bhejte hi
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });

    } catch (e) {
      console.log("AUTO DOWNLOAD ERROR:", e.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};

module.exports.run = async function ({ api, event }) {
  // Ye run function tab kaam karega jab koi sirf '!auto' likhega
  api.sendMessage("Ahmad bhai, system 'Auto Mode' par hai. Bas link send karein, main khud download kar loonga! 🦅", event.threadID);
};
