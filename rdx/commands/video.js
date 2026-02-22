const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search"); // Aapki apni search library

module.exports = {
  config: {
    name: "video",
    aliases: ["v", "ytv"],
    version: "2.0.0",
    author: "Sardar RDX",
    countDown: 10,
    role: 0,
    description: "Internal Search + External Download",
    category: "media",
    guide: "{pn} [song name]",
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return send.reply("❌ Oye saste hero! 🖕 Naam likh warna system hila dungi! 😏🔥");

    try {
      send.reply(`🔍 "${query}" ko apne system mein dhoond rahi hoon... 😏⏳`);

      // 🔥 APNI SEARCH API (Internal Logic)
      const searchResult = await yts(query);
      const video = searchResult.videos[0]; // Pehla result uthao

      if (!video) return send.reply("❌ Teri kismat hi kharab hai! 🖕 Kuch nahi mila. 😏");

      const videoUrl = video.url;
      const { title, timestamp, author, views } = video;

      // 📥 DOWNLOADER (Abhi bhi external use kar rahe hain kyunki downloading ke liye server heavy chahiye)
      const downloadRes = await axios.get(`https://anabot.my.id/api/download/ytmp4?url=${encodeURIComponent(videoUrl)}`);
      
      if (!downloadRes.data.success || !downloadRes.data.result.urls) {
        return send.reply("❌ Search toh mil gayi par download system hila hua hai! 😂 Re-try kar.");
      }

      const downloadUrl = downloadRes.data.result.urls;
      const filePath = path.join(__dirname, "cache", `rdx_video_${Date.now()}.mp4`);

      // File download process
      const response = await axios.get(downloadUrl, { responseType: "arraybuffer" });
      
      if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, Buffer.from(response.data));

      return api.sendMessage({
        body: `✅ AHMAD RDX POWERED SYSTEM! 🔥\n\n🎬 Title: ${title}\n⏱️ Time: ${timestamp}\n👤 Channel: ${author.name}\n👀 Views: ${views.toLocaleString()}\n\nAb bol, kiska software update karun? 😏🖕`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (err) {
      console.error(err);
      return send.reply("❌ Error: Mere system mein koi virus ghus gaya lagta hai! 😂");
    }
  }
                             };
                             
