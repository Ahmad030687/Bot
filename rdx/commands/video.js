const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "video",
    aliases: ["v", "rdx", "song"],
    version: "10.0.0",
    author: "Sardar RDX",
    countDown: 5,
    role: 0,
    description: "Private Search + Anabot Downloader",
    category: "media",
    guide: "{pn} [song name]",
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return send.reply("❌ Oye saste hero! 🥵 Khali dabba mat bhej, gaane ka naam likh! 😏🔥");

    try {
      send.reply(`🔍 "${query}" ko 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 mein dhoond rahi hoon... 😏⏳`);

      // 1️⃣ STEP: SEARCH VIA YOUR PYTHON API
      const searchRes = await axios.get(`https://simapi-no8v.onrender.com/search?q=${encodeURIComponent(query)}&key=ahmad_rdx_private_786`);

      if (searchRes.data.status !== "success" || !searchRes.data.result) {
        return send.reply("❌ Teri kismat kharab hai! 😲 Search mein kuch nahi mila. 😏");
      }

      const videoUrl = searchRes.data.result.url;
      const videoTitle = searchRes.data.result.title;

      send.reply(`📥 Video mil gayi: "${videoTitle}"\nAbhi Send krta ho`);

      // 2️⃣ STEP: DOWNLOAD VIA ANABOT API
      // Hum apikey 'freeApikey' use kar rahe hain jaisa aapne script mein dikhaya
      const downloadApiUrl = `https://anabot.my.id/api/download/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=144&apikey=freeApikey`;
      const dlRes = await axios.get(downloadApiUrl);

      // JSON Path Fix: data -> result -> urls (Aapke response ke mutabiq)
      if (!dlRes.data.success || !dlRes.data.data.result.urls) {
        return send.reply("❌ Bot ne auqat dikha di! 😂 Link se kaam chala lo: " + videoUrl);
      }

      const finalDownloadUrl = dlRes.data.data.result.urls;
      const filePath = path.join(__dirname, "cache", `rdx_${Date.now()}.mp4`);

      // 3️⃣ STEP: FILE DOWNLOAD (Stream Mode for stability)
      const response = await axios({
        method: 'get',
        url: finalDownloadUrl,
        responseType: 'stream'
      });

      if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
      
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        return api.sendMessage({
          body: `✅ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐍𝐄 𝐕𝐈𝐃𝐄𝐎 𝐃𝐄𝐃𝐈! 🔥\n\n🎬 Title: ${videoTitle}\n\n𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 ka 𝐒𝐘𝐒𝐓𝐄𝐌 hai, halke mein mat lena! 😏🖕`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

      writer.on('error', (err) => {
        throw err;
      });

    } catch (err) {
      console.error(err);
      const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
      return send.reply(`❌ Error: ${errorMsg}\nSystem phat gaya! 😂😏`);
    }
  }
};
