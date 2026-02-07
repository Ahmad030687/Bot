const axios = require("axios");
const fetch = require("node-fetch");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "music",
    aliases: [],
    version: "1.0",
    credits: "SARDAR RDX",
    description: "Download song from name",
    category: "media",
    usage: "music [name]",
    prefix: true
  },

  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("Song name likho.", threadID, messageID);
    }

    const wait = await api.sendMessage("⏳ Processing...", threadID, messageID);

    try {
      const apiUrl = `https://anabot.my.id/api/download/playmusic?query=${encodeURIComponent(query)}&apikey=freeApikey`;

      const response = await axios.get(apiUrl);

      if (!response.data.success || !response.data.data.result.success) {
        throw new Error("API failed");
      }

      const result = response.data.data.result;
      const downloadUrl = result.urls;
      const meta = result.metadata;

      const headers = {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://anabot.my.id/',
      };

      const song = await fetch(downloadUrl, { headers });

      if (!song.ok) throw new Error("Download failed");

      const buffer = await song.buffer();

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp3`);
      fs.writeFileSync(filePath, buffer);

      const body =
`🎵 ${meta.title}
👤 ${meta.channel}
⏱ ${Math.floor(meta.duration / 60)}:${(meta.duration % 60).toString().padStart(2, '0')}`;

      await api.sendMessage({
        body,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(wait.messageID);
      }, messageID);

    } catch (e) {
      api.unsendMessage(wait.messageID);
      return api.sendMessage("❌ " + e.message, threadID, messageID);
    }
  }
};
