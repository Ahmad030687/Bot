const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Search and download high quality music",
  commandCategory: "media",
  usages: "[song name]",
  cooldowns: 5
};

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

// ================= RUN (Search Logic) =================
module.exports.run = async function ({ api, event, args, client }) {
  const { threadID, messageID, senderID } = event;
  const { OWNER_NAME } = global.config; // 🛡️ Fix for Owner Name
  const query = args.join(" ");

  if (!query) return api.sendMessage("❓ Ustad ji, gane ka naam toh likhein! (Maslan: #music Bewafa)", threadID, messageID);

  try {
    const search = await yts(query);
    const videos = search.videos.slice(0, 10);

    if (!videos.length) return api.sendMessage("❌ Kuch nahi mila, dobara try karein.", threadID, messageID);

    let msg = `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂**\n━━━━━━━━━━━━━━━\n🔍 Reply with number:\n\n`;
    for (let i = 0; i < videos.length; i++) {
      msg += `${i + 1}. ${videos[i].title} [${videos[i].timestamp}]\n`;
    }
    msg += `\n━━━━━━━━━━━━━━━\n👑 Owner: ${OWNER_NAME}`;

    api.sendMessage(msg, threadID, (err, info) => {
      if (!client.handleReply) client.handleReply = [];

      client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        videos: videos
      });
    }, messageID);

  } catch (e) {
    api.sendMessage("❌ Search error: " + e.message, threadID, messageID);
  }
};

// ================= HANDLE REPLY (Download Logic) =================
module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;

  if (handleReply.author != senderID) return; // Sirf wahi reply kar sakay jisne search kiya

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > handleReply.videos.length) {
    return api.sendMessage("❌ Galat number ustad ji! 1 se 10 ke darmiyan chunain.", threadID, messageID);
  }

  const video = handleReply.videos[choice - 1];

  // List message ko hata dena
  try { api.unsendMessage(handleReply.messageID); } catch {}

  const wait = await api.sendMessage(`⏳ "${video.title}" download ho raha hai...`, threadID);

  try {
    const apiConfig = await axios.get(nix);
    const nixtube = apiConfig.data.nixtube;

    // 🔥 Type badal kar 'audio' kar diya gaya hai
    const res = await axios.get(
      `${nixtube}?url=${encodeURIComponent(video.url)}&type=audio`
    );

    const dl = res.data.downloadUrl || (res.data.data && res.data.data.downloadUrl);

    if (!dl) throw new Error("Server ne link nahi diya.");

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const file = path.join(cacheDir, `${Date.now()}.mp3`);

    const stream = await axios({
      url: dl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(file);
    stream.data.pipe(writer);

    writer.on("finish", async () => {
      const size = fs.statSync(file).size / 1024 / 1024;

      await api.sendMessage({
        body: `🎵 **𝐌𝐔𝐒𝐈𝐂 𝐇𝐀𝐙𝐈𝐑 𝐇𝐀𝐈**\n━━━━━━━━━━━━━━━\n🎼 Title: ${video.title}\n📦 Size: ${size.toFixed(1)} MB\n🦅 Aura: Level 100`,
        attachment: fs.createReadStream(file)
      }, threadID, messageID);

      fs.unlinkSync(file); // File delete karna taake storage na bharay
      api.unsendMessage(wait.messageID);
    });

  } catch (e) {
    api.unsendMessage(wait.messageID);
    api.sendMessage("❌ Download error: " + e.message, threadID, messageID);
  }
};
