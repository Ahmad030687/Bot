const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "video",
    aliases: ["v", "rdx", "play"],
    version: "6.0.0",
    author: "Sardar RDX",
    countDown: 10,
    role: 0,
    description: "Search + Dual Downloader (Anabot + Private)",
    category: "media",
    guide: "{pn} [song name]",
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return send.reply("❌ Oye saste hero! 🖕 Gana nu naam to lakh! 😏🔥");

    try {
      send.reply(`🔍 "${query}" ne system ma dhoodhu chu... Sabr kar! 😏⏳`);

      // 1️⃣ STEP: SEARCH VIA YOUR PYTHON API
      const searchRes = await axios.get(`https://simapi-no8v.onrender.com/search?q=${encodeURIComponent(query)}&key=ahmad_rdx_private_786`);

      if (searchRes.data.status !== "success") {
        return send.reply("❌ Search fail thai gayi! YouTube tara thi naraj che. 😂");
      }

      const videoUrl = searchRes.data.result.url;
      const videoTitle = searchRes.data.result.title;
      let finalDownloadUrl = "";

      // 2️⃣ STEP: TRY ANABOT FIRST
      try {
        const anabotRes = await axios.get(`https://anabot.my.id/api/download/ytmp4?url=${encodeURIComponent(videoUrl)}`);
        if (anabotRes.data.success) {
          finalDownloadUrl = anabotRes.data.data.result.urls;
        }
      } catch (e) {
        console.log("Anabot fail, switching to Private API...");
      }

      // 3️⃣ STEP: FALLBACK TO YOUR PRIVATE DOWNLOAD API (If Anabot fails)
      if (!finalDownloadUrl) {
        const privateRes = await axios.get(`https://simapi-no8v.onrender.com/ahmad-dl?url=${encodeURIComponent(videoUrl)}`);
        if (privateRes.data.status) {
          finalDownloadUrl = privateRes.data.url;
        }
      }

      if (!finalDownloadUrl) {
        return send.reply("❌ Badha rasta band che! 😂 Link thi kam chalavi le: " + videoUrl);
      }

      // 4️⃣ STEP: DOWNLOAD & SEND
      const filePath = path.join(__dirname, "cache", `rdx_${Date.now()}.mp4`);
      const response = await axios({
        method: 'get',
        url: finalDownloadUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        return api.sendMessage({
          body: `✅ LE TARA VIDEO! 🔥\n\n🎬 Title: ${videoTitle}\n\nSardar RDX no system che, halke ma na leta! 😏🖕`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

      writer.on('error', () => send.reply("❌ File writing ma locho thayo!"));

    } catch (err) {
      console.error(err);
      return send.reply(`❌ Error: ${err.message}. System phati gayu! 😂😏`);
    }
  }
};
