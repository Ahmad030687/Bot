/**
 * ig.js - Instagram Video Downloader
 * Credits: Ahmad Ali Safdar | Sardar RDX
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ig",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Instagram reels/posts/videos",
  commandCategory: "media",
  usages: "#ig <instagram link>",
  cooldowns: 8
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  const igUrl = args[0];
  if (!igUrl) {
    return api.sendMessage(
      "⚠️ Instagram link do\nExample:\n#ig https://www.instagram.com/reel/xxxx/",
      threadID,
      messageID
    );
  }

  api.sendMessage("📥 Instagram video fetch ho rahi hai...", threadID, messageID);

  try {
    const encodedParams = new URLSearchParams();
    encodedParams.append("url", igUrl);

    const options = {
      method: "POST",
      url: "https://instagram-video-downloader24.p.rapidapi.com/index.php",
      headers: {
        "x-rapidapi-key": "6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618",
        "x-rapidapi-host": "instagram-video-downloader24.p.rapidapi.com",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: encodedParams
    };

    const res = await axios.request(options);

    const videoUrl = res.data?.video || res.data?.media?.[0]?.url;
    if (!videoUrl) {
      return api.sendMessage("❌ Video nahi mili, private ya invalid link ho sakta hai.", threadID, messageID);
    }

    const filePath = path.join(__dirname, `/cache/ig_${Date.now()}.mp4`);
    const videoData = await axios.get(videoUrl, { responseType: "stream" });

    const writer = fs.createWriteStream(filePath);
    videoData.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: "🎬 **Instagram Video Downloaded**",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Instagram downloader API error a gaya.", threadID, messageID);
  }
};
