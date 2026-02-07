const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "mp4",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Shaan Khan",
  description: "Search and download video",
  commandCategory: "media",
  usages: "[name]",
  cooldowns: 5
};

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

// ================= RUN =================
module.exports.run = async function ({ api, event, args, client }) {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("❌ Video name do.", threadID, messageID);

  try {
    const search = await yts(query);
    const videos = search.videos.slice(0, 10);

    if (!videos.length) return api.sendMessage("❌ Result nahi mila.", threadID, messageID);

    let msg = "🔍 Reply number:\n\n";
    for (let i = 0; i < videos.length; i++) {
      msg += `${i + 1}. ${videos[i].title} (${videos[i].timestamp})\n`;
    }

    api.sendMessage(msg, threadID, (err, info) => {
      if (!client.replies) client.replies = new Map();

      client.replies.set(info.messageID, {
        commandName: module.exports.config.name,
        author: senderID,
        data: { videos, listMsg: info.messageID }
      });
    }, messageID);

  } catch (e) {
    api.sendMessage("❌ Search error: " + e.message, threadID, messageID);
  }
};

// ================= HANDLE REPLY =================
module.exports.handleReply = async function ({
  api,
  event,
  data
}) {
  const { threadID, messageID, senderID, body } = event;

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > data.videos.length) {
    return api.sendMessage("❌ Galat number.", threadID, messageID);
  }

  const video = data.videos[choice - 1];

  // delete list
  try { api.unsendMessage(data.listMsg); } catch {}

  const wait = await api.sendMessage("⏳ Download ho raha hai...", threadID);

  try {
    const apiConfig = await axios.get(nix);
    const nixtube = apiConfig.data.nixtube;

    const res = await axios.get(
      `${nixtube}?url=${encodeURIComponent(video.url)}&type=video&quality=360`
    );

    const dl =
      res.data.downloadUrl ||
      (res.data.data && res.data.data.downloadUrl);

    if (!dl) throw new Error("Link nahi mila");

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const file = path.join(cacheDir, `${Date.now()}.mp4`);

    const stream = await axios({
      url: dl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(file);
    stream.data.pipe(writer);

    writer.on("finish", async () => {
      const size = fs.statSync(file).size / 1024 / 1024;

      if (size > 100) {
        fs.unlinkSync(file);
        api.unsendMessage(wait.messageID);
        return api.sendMessage("⚠️ File bari hai.\n" + dl, threadID, messageID);
      }

      await api.sendMessage({
        body: `🎬 ${video.title}\n📦 ${size.toFixed(1)} MB`,
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
