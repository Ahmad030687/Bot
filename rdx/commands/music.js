const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("yt-search");

module.exports.config = {
  name: "music",
  version: "5.0.0",
  credits: "SARDAR RDX",
  description: "High-Speed YouTube Music via RDX Backend",
  commandCategory: "Media",
  usages: "[song name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const songName = args.join(" ");

  if (!songName) return api.sendMessage("⚠️ **𝐔𝐒𝐀𝐆𝐄 𝐆𝐔𝐈𝐃𝐄**\n━━━━━━━━━━━━━━━\nType: #music [song name]\nExample: #music tu hai kahan", threadID, messageID);

  const waitMsg = await api.sendMessage(`🎵 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂**\n━━━━━━━━━━━━━━━\n🔍 Searching: ${songName}\n⌛ Fetching Direct Stream...`, threadID);

  try {
    // 1. YouTube Search to get Video URL
    const search = await ytSearch(songName);
    const video = search.videos[0];
    if (!video) throw new Error("Song not found!");

    // 2. Call YOUR OWN Render Backend
    const backendUrl = `https://yt-api-7mfm.onrender.com/ahmad-dl?url=${encodeURIComponent(video.url)}`;
    const res = await axios.get(backendUrl);

    if (!res.data.status) throw new Error("Backend failed to extract link");

    const directAudioUrl = res.data.url;
    const cachePath = path.join(__dirname, "cache", `rdx_music_${Date.now()}.mp3`);
    fs.ensureDirSync(path.join(__dirname, "cache"));

    // 3. Download the Stream and Send
    const audioStream = await axios.get(directAudioUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(audioStream.data));

    await api.unsendMessage(waitMsg.messageID);

    return api.sendMessage({
      body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐏𝐋𝐀𝐘𝐄𝐑**\n━━━━━━━━━━━━━━━\n🎵 **Title:** ${res.data.title}\n⏱️ **Duration:** ${video.timestamp}\n👤 **Artist:** ${video.author.name}\n━━━━━━━━━━━━━━━`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (e) {
    if (waitMsg) api.unsendMessage(waitMsg.messageID);
    console.error(e);
    return api.sendMessage("❌ **𝐄𝐑𝐑𝐎𝐑:** Direct stream block ho chuki hai ya server busy hai.", threadID, messageID);
  }
};
