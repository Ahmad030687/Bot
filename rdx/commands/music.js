const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("yt-search");

module.exports.config = {
  name: "music",
  version: "5.1.0",
  credits: "SARDAR RDX",
  description: "Fixed YouTube Music via RDX Backend",
  commandCategory: "Media",
  usages: "[song name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const songName = args.join(" ");

  if (!songName) return api.sendMessage("⚠️ **Usage:** #music [song name]", threadID, messageID);

  const waitMsg = await api.sendMessage(`🎵 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂**\n━━━━━━━━━━━━━━━\n🔍 Searching: ${songName}\n⌛ Connecting to Secure Stream...`, threadID);

  try {
    const search = await ytSearch(songName);
    const video = search.videos[0];
    if (!video) throw new Error("Music not found on YouTube!");

    // 🔗 Your Render URL
    const backendUrl = `https://yt-api-7mfm.onrender.com/ahmad-dl?url=${encodeURIComponent(video.url)}`;
    
    // Request with longer timeout
    const res = await axios.get(backendUrl, { timeout: 30000 });

    if (!res.data.status) {
      const errorMsg = res.data.msg || "YouTube blocked the request.";
      throw new Error(`Backend Error: ${errorMsg}`);
    }

    const directAudioUrl = res.data.url;
    const cachePath = path.join(__dirname, "cache", `rdx_${Date.now()}.mp3`);
    fs.ensureDirSync(path.join(__dirname, "cache"));

    // Downloading the stream
    const audioStream = await axios.get(directAudioUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(audioStream.data));

    await api.unsendMessage(waitMsg.messageID);

    return api.sendMessage({
      body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐏𝐋𝐀𝐘𝐄𝐑**\n━━━━━━━━━━━━━━━\n🎵 **Title:** ${res.data.title}\n⏱️ **Duration:** ${video.timestamp}\n━━━━━━━━━━━━━━━`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (e) {
    if (waitMsg) api.unsendMessage(waitMsg.messageID);
    console.error(e);
    
    // User ko asli error dikhana
    const finalError = e.message || "Unknown Server Error";
    return api.sendMessage(`❌ **𝐄𝐑𝐑𝐎𝐑:** ${finalError}\n\n💡 *Tip: Try a different song or check Render Logs.*`, threadID, messageID);
  }
};
