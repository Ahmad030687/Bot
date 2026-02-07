const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "mp4",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Professional Video Search & Auto-Delete List",
  commandCategory: "media",
  usages: "[video name]",
  cooldowns: 5
};

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

// ================= RUN (Professional UI) =================
module.exports.run = async function ({ api, event, args, client }) {
  const { threadID, messageID, senderID } = event;
  const { OWNER_NAME } = global.config; 
  const query = args.join(" ");

  if (!query) return api.sendMessage("⚠️ Ustad ji, video ka naam toh likhein!", threadID, messageID);

  try {
    const search = await yts(query);
    const videos = search.videos.slice(0, 10);

    if (!videos.length) return api.sendMessage("❌ Result nahi mila.", threadID, messageID);

    // ✨ PREMIUM ATTRACTIVE LIST DESIGN
    let msg = `🎬 ━━━ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 ━━━ 🎬\n`;
    msg += `🔎 𝐒𝐞𝐚𝐫𝐜𝐡: "${query.toUpperCase()}"\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (let i = 0; i < videos.length; i++) {
      msg += `【 𝟎${i + 1} 】 🎵 ${videos[i].title}\n`;
      msg += `⏱️ 𝐓𝐢𝐦𝐞: ${videos[i].timestamp} | 📺 ${videos[i].author.name}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    }

    msg += `\n📥 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐧𝐮𝐦𝐛𝐞𝐫 (𝟏-𝟏𝟎)\n`;
    msg += `👤 𝐎𝐰𝐧𝐞𝐫: ${OWNER_NAME}`;

    api.sendMessage(msg, threadID, (err, info) => {
      if (!client.replies) client.replies = new Map();

      client.replies.set(info.messageID, {
        commandName: module.exports.config.name,
        author: senderID,
        data: { videos, listMsg: info.messageID }
      });
    }, messageID);

  } catch (e) {
    api.sendMessage("❌ Error: " + e.message, threadID, messageID);
  }
};

// ================= HANDLE REPLY (Auto-Delete Logic) =================
module.exports.handleReply = async function ({ api, event, data }) {
  const { threadID, messageID, senderID, body } = event;
  const { OWNER_NAME } = global.config;

  if (data.author != senderID) return; 

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > data.videos.length) {
    return api.sendMessage("❌ Galat number! 1 se 10 ke darmiyan chunain.", threadID, messageID);
  }

  const video = data.videos[choice - 1];

  // 🔥 AUTO-DELETE: Jaise hi number mile, list message ko delete kar do
  try { 
    api.unsendMessage(data.listMsg); 
  } catch (e) { console.log("Delete error: " + e); }

  const wait = await api.sendMessage(`⏳ "${video.title}" 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐡𝐨 𝐫𝐚𝐡𝐚 𝐡𝐚𝐢...`, threadID);

  try {
    const apiConfig = await axios.get(nix);
    const nixtube = apiConfig.data.nixtube;

    const res = await axios.get(`${nixtube}?url=${encodeURIComponent(video.url)}&type=video&quality=360`);
    const dl = res.data.downloadUrl || (res.data.data && res.data.data.downloadUrl);

    if (!dl) throw new Error("Server ne link nahi diya.");

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);
    const file = path.join(cacheDir, `${Date.now()}.mp4`);

    const stream = await axios({ url: dl, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(file);
    stream.data.pipe(writer);

    writer.on("finish", async () => {
      const size = fs.statSync(file).size / 1024 / 1024;

      await api.sendMessage({
        body: `🎬 **𝐕𝐈𝐃𝐄𝐎 𝐇𝐀𝐙𝐈𝐑 𝐇𝐀𝐈**\n━━━━━━━━━━━━━━━\n📽️ 𝐓𝐢𝐭𝐥𝐞: ${video.title}\n📦 𝐒𝐢𝐳𝐞: ${size.toFixed(1)} MB\n👑 𝐎𝐰𝐧𝐞𝐫: ${OWNER_NAME}`,
        attachment: fs.createReadStream(file)
      }, threadID, messageID);

      fs.unlinkSync(file);
      api.unsendMessage(wait.messageID);
    });

  } catch (e) {
    api.unsendMessage(wait.messageID);
    api.sendMessage("❌ Download error: " + e.message, threadID, messageID);
  }
};
