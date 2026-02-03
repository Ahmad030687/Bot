const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "auto",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "FB/IG/TikTok Video Downloader via RDX Python API",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("❌ Link to dein Ahmad bhai!", threadID, messageID);

  // 🦅 Aapki Nayi Python API ka Link
  const RDX_API = `https://ahmad-rdx-api.onrender.com/rdx-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage("⏳ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Processing via Python Engine...", threadID, messageID);

  try {
    const res = await axios.get(RDX_API);
    
    if (res.data.status && res.data.url) {
      const videoUrl = res.data.url;
      const title = res.data.title || "Video";
      const filePath = path.join(__dirname, `/cache/rdx_video_${Date.now()}.mp4`);

      // Video Download logic
      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑**\n\n📝 Title: ${title}\n✅ Success via Python Server`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });
    } else {
      api.sendMessage("❌ API ne video link nahi diya. Shayad link private hai.", threadID, messageID);
    }
  } catch (error) {
    api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
  }
};
