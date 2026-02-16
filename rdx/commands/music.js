const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "20.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "High-Speed Private Downloader (No Timeout)",
  commandCategory: "media",
  usages: "[song name] [audio/video]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // 1. Input Check
  let lastArg = args[args.length - 1]?.toLowerCase();
  let type = "video";
  if (["audio", "mp3", "song"].includes(lastArg)) { type = "audio"; args.pop(); }
  else if (["video", "mp4"].includes(lastArg)) { type = "video"; args.pop(); }

  const query = args.join(" ");
  if (!query) return api.sendMessage("🦅 Ahmad bhai, gane ka naam to likho!", threadID, messageID);

  let loading = await api.sendMessage("🔎 RDX System: Searching and Processing...", threadID);

  try {
    // Search Video
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return api.editMessage("❌ Gana nahi mila!", loading.messageID);

    // Private API Call (Unlimited Timeout)
    const apiUrl = `https://simapi-no8v.onrender.com/download?url=${encodeURIComponent(video.url)}&type=${type}&key=ahmad_rdx_private_786`;
    
    const res = await axios.get(apiUrl, { timeout: 0 }); // 0 means no timeout
    const dlLink = res.data.downloadUrl;

    if (!dlLink) throw new Error("API link blank hai!");

    // Download Path
    const ext = type === "audio" ? "mp3" : "mp4";
    const filePath = path.join(__dirname, "cache", `${Date.now()}.${ext}`);
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

    // Real Downloading Logic
    const response = await axios({
      method: 'GET',
      url: dlLink,
      responseType: 'stream',
      timeout: 0 // Waiting for full file
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Ye part tabhi chalega jab file puri tarah download ho jaye
    writer.on('finish', () => {
      const size = fs.statSync(filePath).size / (1024 * 1024);
      
      if (size > 48) {
        fs.unlinkSync(filePath);
        return api.editMessage("⚠️ File 50MB se badi hai, Messenger allow nahi karta!", loading.messageID);
      }

      api.unsendMessage(loading.messageID);
      
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑**\n━━━━━━━━━━━━━\n🎵 Title: ${video.title}\n📦 Size: ${size.toFixed(2)} MB\n✅ Status: Sent!`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on('error', (e) => {
      api.editMessage("❌ Write Error: " + e.message, loading.messageID);
    });

  } catch (err) {
    api.editMessage(`❌ RDX Server Error: ${err.message}`, loading.messageID);
  }
};
