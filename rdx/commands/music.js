const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "audio",
    aliases: ["m", "audio", "gaana"],
    version: "2.0.0",
    author: "Sardar RDX",
    countDown: 5,
    role: 0,
    description: "Private Search + Anabot MP3 Downloader",
    category: "media",
    guide: "{pn} [song name]",
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return send.reply("❌ Oye saste hero! 🥱 Khali dabba mat bhej, gaane ka naam likh! 😏🔥");

    try {
      send.reply(`🎵 "${query}" ko 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 mein dhoond rahi hoon... 😏⏳`);

      // 1️⃣ STEP: SEARCH (Aapki Python API)
      const searchRes = await axios.get(`https://simapi-no8v.onrender.com/search?q=${encodeURIComponent(query)}&key=ahmad_rdx_private_786`);

      if (searchRes.data.status !== "success" || !searchRes.data.result) {
        return send.reply("❌ Teri kismat kharab hai! 😆 Gaana nahi mila. 😏");
      }

      const videoUrl = searchRes.data.result.url;
      const videoTitle = searchRes.data.result.title;

      send.reply(`📥 Gaana mil gaya: "${videoTitle}"\nAb audio nikal rahi hoon... 😏🔥`);

      // 2️⃣ STEP: DOWNLOAD AUDIO (Anabot MP3 API)
      // Path: data -> result -> urls
      const dlRes = await axios.get(`https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=freeApikey`);

      if (!dlRes.data.success || !dlRes.data.data.result.urls) {
        return send.reply("❌ Audio downloader ne auqat dikha di! 😂");
      }

      const finalAudioLink = dlRes.data.data.result.urls;
      const filePath = path.join(__dirname, "cache", `rdx_${Date.now()}.mp3`);

      // 3️⃣ STEP: DOWNLOAD FILE
      const response = await axios({
        method: 'get',
        url: finalAudioLink,
        responseType: 'stream'
      });

      if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
      
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        return api.sendMessage({
          body: `✅ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐍𝐄 𝐀𝐔𝐃𝐈𝐎 𝐃𝐄 𝐃𝐈𝐀! 🎵\n\n🎬 Title: ${videoTitle}\n👤 Channel: ${searchRes.data.result.uploader}\n\n𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 ka 𝐒𝐘𝐒𝐓𝐄𝐌 on hai! 😏😎`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

    } catch (err) {
      console.error(err);
      return send.reply(`❌ Error: ${err.message}\nAudio system phat gaya! 😂😏`);
    }
  }
};
