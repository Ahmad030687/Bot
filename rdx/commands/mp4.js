const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "mp4",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Search and download video (RDX Listener Compatible)",
  commandCategory: "Media",
  usages: "[video name]",
  cooldowns: 5,
};

// 🔗 API Source (AryanNix)
const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("❌ Ustad ji, video ka naam likhein!", threadID, messageID);

  api.sendMessage(`🔍 **AHMAD RDX** dhoond raha hai: "${query}"...`, threadID, messageID);

  try {
    const searchResults = await yts(query);
    const videos = searchResults.videos.slice(0, 10);

    if (videos.length === 0) return api.sendMessage("❌ Koi video nahi mili.", threadID, messageID);

    // List Banani
    let searchList = "🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐕𝐈𝐃𝐄𝐎 𝐋𝐈𝐒𝐓**\n━━━━━━━━━━━━━━━\n";
    for (let i = 0; i < videos.length; i++) {
      searchList += `${i + 1}. 🎬 ${videos[i].title}\n⏱️ ${videos[i].timestamp}\n\n`;
    }
    searchList += `━━━━━━━━━━━━━━━\n👉 **Download karne ke liye 1-10 reply karein.**`;

    // 🛠️ CRITICAL FIX FOR LISTENER
    // Hum simple push method use kar rahe hain jo har RDX/Mirai bot par chalta hai
    return api.sendMessage(searchList, threadID, (err, info) => {
      if (err) return; // Agar message send fail ho jaye

      // Agar handleReply array exist nahi karta toh bana do (Safety Check)
      if (!global.client.handleReply) global.client.handleReply = [];

      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        videos: videos
      });
    }, messageID);

  } catch (err) {
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;

  // Security: Sirf wahi banda reply kar sake jisne command lagayi
  if (handleReply.author !== senderID) return;

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > handleReply.videos.length) {
    return api.sendMessage("⚠️ Ghalat number! 1 se 10 ke darmiyan likhein.", threadID, messageID);
  }

  const selectedVideo = handleReply.videos[choice - 1];

  // Purana message delete karna
  api.unsendMessage(handleReply.messageID);

  const waitMsg = await api.sendMessage(`📥 **Downloading:** ${selectedVideo.title}\n⏳ Please wait...`, threadID);

  try {
    // 1. API se Link lena
    const apiConfig = await axios.get(nix);
    const nixtubeApi = apiConfig.data.nixtube;
    
    // 360p Quality Fixed
    const res = await axios.get(`${nixtubeApi}?url=${encodeURIComponent(selectedVideo.url)}&type=video&quality=360`);
    
    // API Link Check
    const downloadUrl = res.data.downloadUrl || (res.data.data && res.data.data.downloadUrl);
    if (!downloadUrl) throw new Error("API Link Fail");

    const cachePath = path.join(__dirname, "cache", `rdx_vid_${Date.now()}.mp4`);
    
    // Cache Folder Safety
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
    }

    // 2. Stream Download
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(cachePath);
    response.data.pipe(writer);

    writer.on('finish', async () => {
      const stats = fs.statSync(cachePath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      // Limit check (80MB for Facebook Safety)
      if (stats.size > 83886080) { 
        fs.unlinkSync(cachePath);
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(`⚠️ File bari hai (${fileSizeInMB}MB). Link:\n${downloadUrl}`, threadID, messageID);
      }

      // 3. Send Video
      const msg = {
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐋𝐀𝐘𝐄𝐑**\n━━━━━━━━━━━━━━━\n🎬 **Title:** ${selectedVideo.title}\n📦 **Size:** ${fileSizeInMB}MB\n━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(cachePath)
      };

      api.sendMessage(msg, threadID, (err) => {
        if (err) api.sendMessage(`❌ Upload Error. Link: ${downloadUrl}`, threadID, messageID);
        
        // File bhejne ke baad delete kar do
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        api.unsendMessage(waitMsg.messageID);
      }, messageID);
    });

  } catch (err) {
    api.unsendMessage(waitMsg.messageID);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};
          
