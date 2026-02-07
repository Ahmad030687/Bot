const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Hybrid Downloader (MP3/MP4) with Auto-Format Memory",
  commandCategory: "media",
  usages: "[name] mp3/mp4",
  cooldowns: 5
};

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

// ================= RUN =================
module.exports.run = async function ({ api, event, args, client }) {
  const { threadID, messageID, senderID } = event;
  
  // 1. Format aur Query nikalna
  let typeInput = args[args.length - 1]?.toLowerCase();
  let downloadType = "video"; // Default
  let formatLabel = "𝐕𝐈𝐃𝐄𝐎";

  if (typeInput === "mp3" || typeInput === "audio") {
    downloadType = "audio";
    formatLabel = "𝐀𝐔𝐃𝐈𝐎";
    args.pop(); // mp3 ko search query se hata dena
  } else if (typeInput === "mp4" || typeInput === "video") {
    downloadType = "video";
    formatLabel = "𝐕𝐈𝐃𝐄𝐎";
    args.pop(); // mp4 ko search query se hata dena
  }

  const query = args.join(" ");
  if (!query) return api.sendMessage("⚠️ Ustad ji, naam ke sath format likhein!\nExample: #mp4 Bewafa mp3", threadID, messageID);

  try {
    const search = await yts(query);
    const videos = search.videos.slice(0, 10);
    if (!videos.length) return api.sendMessage("❌ Result nahi mila.", threadID, messageID);

    // ✨ PREMIUM UI LIST
    let msg = `🦅 ━━━━ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 ━━━━ 🦅\n`;
    msg += `📥 𝐅𝐨𝐫𝐦𝐚𝐭: ${formatLabel}\n`;
    msg += `🔎 𝐒𝐞𝐚𝐫𝐜𝐡: "${query.toUpperCase()}"\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (let i = 0; i < videos.length; i++) {
      msg += `【 𝟎${i + 1} 】 🎵 ${videos[i].title}\n`;
      msg += `⏱️ 𝐓𝐢𝐦𝐞: ${videos[i].timestamp} | 📺 ${videos[i].author.name}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    }

    msg += `\n📥 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐧𝐮𝐦𝐛𝐞𝐫 (𝟏-𝟏𝟎)\n`;
    msg += `👤 𝐎𝐰𝐧𝐞𝐫: AHMAD RDX`;

    api.sendMessage(msg, threadID, (err, info) => {
      if (!client.replies) client.replies = new Map();
      client.replies.set(info.messageID, {
        commandName: this.config.name,
        author: senderID,
        videos: videos,
        listMsg: info.messageID,
        downloadType: downloadType // Yahan format save kar liya
      });
    }, messageID);

  } catch (e) {
    api.sendMessage("❌ Search error: " + e.message, threadID, messageID);
  }
};

// ================= HANDLE REPLY =================
module.exports.handleReply = async function ({ api, event, client, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  
  const data = handleReply || (client.replies ? client.replies.get(event.messageReply.messageID) : null);
  if (!data || data.author != senderID) return;

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > data.videos.length) {
    return api.sendMessage("❌ Galat number ustad ji!", threadID, messageID);
  }

  const video = data.videos[choice - 1];
  const type = data.downloadType; // mp3 ya mp4 jo pehle choose kiya tha

  // 🔥 LIST DELETE
  try { api.unsendMessage(data.listMsg); } catch (e) {}

  const wait = await api.sendMessage(`⏳ "${video.title}" (${type.toUpperCase()}) 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐡𝐨 𝐫𝐚𝐡𝐚 𝐡𝐚𝐢...`, threadID);

  try {
    const apiConfig = await axios.get(nix);
    const nixtube = apiConfig.data.nixtube;

    const res = await axios.get(`${nixtube}?url=${encodeURIComponent(video.url)}&type=${type}&quality=360`);
    const dl = res.data.downloadUrl || (res.data.data && res.data.downloadUrl);

    if (!dl) throw new Error("Server ne link nahi diya.");

    const ext = type === "audio" ? "mp3" : "mp4";
    const file = path.join(__dirname, "cache", `${Date.now()}.${ext}`);
    fs.ensureDirSync(path.join(__dirname, "cache"));

    const stream = await axios({ url: dl, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(file);
    stream.data.pipe(writer);

    writer.on("finish", async () => {
      const stats = fs.statSync(file);
      const sizeMB = stats.size / (1024 * 1024);

      if (sizeMB > 100) {
        fs.unlinkSync(file);
        return api.sendMessage("⚠️ File 100MB se bari hai!", threadID, messageID);
      }

      await api.sendMessage({
        body: `🦅 **𝐉𝐀𝐖𝐀𝐁 𝐇𝐀𝐙𝐈𝐑 𝐇𝐀𝐈**\n━━━━━━━━━━━━━━━\n📽️ 𝐓𝐢𝐭𝐥𝐞: ${video.title}\n📦 𝐒𝐢𝐳𝐞: ${sizeMB.toFixed(1)} MB\n👑 𝐎𝐰𝐧𝐞𝐫: AHMAD RDX`,
        attachment: fs.createReadStream(file)
      }, threadID, messageID);

      fs.unlinkSync(file);
      api.unsendMessage(wait.messageID);
    });
  } catch (e) {
    api.unsendMessage(wait.messageID);
    api.sendMessage("❌ Error: " + e.message, threadID, messageID);
  }
};
          
