const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "fb",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Facebook Video Downloader via Ahmad RDX API",
  commandCategory: "downloader",
  usages: "[link]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  // 1. Link Validation
  if (!link || (!link.includes("facebook.com") && !link.includes("fb.watch"))) {
    return api.sendMessage("❌ Ahmad bhai, please aik valid Facebook video link dein!", threadID, messageID);
  }

  // 2. Aapki Render API ka URL
  const RDX_API = `https://ahmad-rdx-api.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;

  api.sendMessage("⏳ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Video process ho rahi hai, thora sabr karein...", threadID, messageID);

  try {
    // API Request
    const res = await axios.get(RDX_API);
    const videoUrl = res.data.url;

    if (!videoUrl) {
      return api.sendMessage("❌ Maaf kijiye Ahmad bhai, video link nahi mil saka. Shayad video private ho.", threadID, messageID);
    }

    // Temporary file path
    const filePath = path.join(__dirname, `/cache/ahmad_rdx_${Date.now()}.mp4`);

    // 3. Video Downloading logic
    const callback = () => {
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑**\n\n✅ Video successfully download ho gayi hai!`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // File delete after send
      }, messageID);
    };

    const request = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream'
    });

    // File writing
    const writer = fs.createWriteStream(filePath);
    request.data.pipe(writer);

    writer.on('finish', callback);
    writer.on('error', (err) => {
        api.sendMessage(`❌ Download error: ${err.message}`, threadID, messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage(`❌ API Error: ${error.message}`, threadID, messageID);
  }
};
