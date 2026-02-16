const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "30.0.0", // Final Working Version
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Private API Fix - Browser Mode",
  commandCategory: "media",
  usages: "[song name] audio/video",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // 1. Input Check
  let lastArg = args[args.length - 1]?.toLowerCase();
  let type = "video";
  
  if (["audio", "mp3", "song"].includes(lastArg)) { type = "audio"; args.pop(); }
  else if (["video", "mp4"].includes(lastArg)) { type = "video"; args.pop(); }

  const query = args.join(" ");
  if (!query) return api.sendMessage("🦅 Ahmad bhai, gane ka naam to likhein!", threadID, messageID);

  let loading = await api.sendMessage("🔎 RDX System: Finding best match...", threadID);

  try {
    // Search Video
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return api.editMessage("❌ Gana nahi mila!", loading.messageID);

    // 🛡️ API URL Setup
    const privateKey = "ahmad_rdx_private_786";
    const apiUrl = `https://simapi-no8v.onrender.com/download?url=${encodeURIComponent(video.url)}&type=${type}&key=${privateKey}`;

    // Update Status
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌**\n━━━━━━━━━━━━━\n🔗 Connecting to Private Server...\n(Bypassing Bot Detection)`, loading.messageID);

    // 🚀 STEP 1: API HIT WITH "FAKE BROWSER HEADERS"
    // Ye headers Render aur YouTube ko dhoka denge ke ye Bot nahi Insaan hai
    const response = await axios.get(apiUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        },
        timeout: 120000 // 2 Minutes wait time (Timeout Error se bachne ke liye)
    });

    if (response.data.status !== "success" || !response.data.downloadUrl) {
        throw new Error(response.data.message || "API ne 200 OK diya lekin link nahi diya!");
    }

    const dlLink = response.data.downloadUrl;
    const songTitle = response.data.title;

    // 🚀 STEP 2: DOWNLOADING FILE
    // Yahan bhi wahi headers use karenge taake Google Video link expire na ho
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌**\n━━━━━━━━━━━━━\n📥 Downloading: ${songTitle}\n🚀 Speed: High Priority`, loading.messageID);

    const ext = type === "audio" ? "mp3" : "mp4";
    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
    const filePath = path.join(cachePath, `rdx_${Date.now()}.${ext}`);

    const fileStream = await axios({
        method: 'GET',
        url: dlLink,
        responseType: 'stream',
        headers: {
             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });

    const writer = fs.createWriteStream(filePath);
    fileStream.data.pipe(writer);

    writer.on('finish', async () => {
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      if (sizeMB > 50) {
        fs.unlinkSync(filePath);
        return api.editMessage("⚠️ File 50MB se bari hai, Messenger allow nahi karta.", loading.messageID);
      }

      await api.unsendMessage(loading.messageID);

      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐋𝐀𝐘𝐄𝐑**\n━━━━━━━━━━━━━━━━━━\n🎵 **Title:** ${songTitle}\n💿 **Type:** ${type.toUpperCase()}\n📦 **Size:** ${sizeMB.toFixed(2)} MB\n✅ **Server:** RDX Private API`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on('error', (err) => {
        throw err;
    });

  } catch (err) {
    console.error("RDX ERROR:", err);
    // Agar 500 error aaye to user ko bataye
    if(err.response && err.response.status === 500) {
        return api.editMessage(`❌ **API Error 500:**\nAhmad bhai, Render server crash ho raha hai. Iska matlab Python code me 'Error Handling' nahi hai. Please main.py update karein.`, loading.messageID);
    }
    api.editMessage(`❌ **System Error:** ${err.message}`, loading.messageID);
  }
};
