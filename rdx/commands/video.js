const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "video",
    aliases: ["v", "play", "ytv"],
    version: "5.0.0",
    author: "Sardar RDX",
    countDown: 10,
    role: 0,
    description: "Private Python Search + Anabot Downloader",
    category: "media",
    guide: "{pn} [song name]",
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    // 1️⃣ INPUT CHECK
    if (!query) return send.reply("❌ Oye saste hero! 🖕 Khali command mat maar, gaane ka naam likh! 😏🔥");

    try {
      send.reply(`🔍 "${query}" ko apne Sardar RDX system mein dhoond rahi hoon... Sabr kar! 😏⏳`);

      // 2️⃣ STEP: SEARCH VIA CUSTOM PYTHON API
      // ⚠️ Apni API ka link aur key zaroor check kar lena
      const searchApiUrl = `https://simapi-no8v.onrender.com/search?q=${encodeURIComponent(query)}&key=ahmad_rdx_private_786`;
      const searchRes = await axios.get(searchApiUrl);

      if (searchRes.data.status !== "success" || !searchRes.data.result) {
        return send.reply("❌ Teri kismat hi kharab hai! 🖕 Search mein kuch nahi mila. 😏");
      }

      // Python API se aane wala data
      const videoUrl = searchRes.data.result.url;
      const videoTitle = searchRes.data.result.title;
      const uploader = searchRes.data.result.uploader;

      // 3️⃣ STEP: DOWNLOAD VIA ANABOT API
      const downloadApiUrl = `https://anabot.my.id/api/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
      const downloadRes = await axios.get(downloadApiUrl);

      if (!downloadRes.data.success || !downloadRes.data.data.result.urls) {
        return send.reply(`❌ Search toh ho gayi par Anabot ka system hila hua hai! 😂 Link ye raha khud kar le: ${videoUrl}`);
      }

      const finalVideoLink = downloadRes.data.data.result.urls;
      const filePath = path.join(__dirname, "cache", `rdx_video_${Date.now()}.mp4`);

      // 4️⃣ STEP: FILE DOWNLOAD & SEND
      const response = await axios.get(finalVideoLink, { responseType: "arraybuffer" });
      
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"));
      }
      fs.writeFileSync(filePath, Buffer.from(response.data));

      return api.sendMessage({
        body: `✅ YE LE TERA VIDEO! 🔥\n\n🎬 Title: ${videoTitle}\n👤 Channel: ${uploader}\n\nSardar RDX ka system hai, halke mein mat lena! 😏🖕`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (err) {
      console.error(err);
      return send.reply("❌ Error: API ne auqat dikha di ya tera net mar gaya! 😂😏");
    }
  }
};
