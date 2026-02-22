const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "audio",
    aliases: ["m", "gaana"],
    version: "FAST-AF",
    author: "Sardar RDX",
    countDown: 2,
    role: 0,
    category: "media",
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    if (!query) return send.reply("❌ Gaane ka naam? 😏");

    try {
      const searchRes = await axios.get(`https://simapi-no8v.onrender.com/search?q=${encodeURIComponent(query)}&key=ahmad_rdx_private_786`);
      const { url: videoUrl, title: videoTitle } = searchRes.data.result;

      const dlRes = await axios.get(`https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=freeApikey`);
      const finalLink = dlRes.data.data.result.urls;

      const filePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);

      const stream = await axios({ method: 'get', url: finalLink, responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      stream.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `🎵 ${videoTitle}\n\n𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 ! ⚡`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

    } catch (err) {
      return send.reply("❌ System phat gaya! 😂");
    }
  }
};
