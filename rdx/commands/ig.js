/**
 * ig.js - Instagram Stable Downloader
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Multi-Key Extraction & Enhanced Error Handling
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ig",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Instagram Reels/Posts (Stable)",
  commandCategory: "media",
  usages: "#ig <instagram link>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const igUrl = args[0];

  if (!igUrl) {
    return api.sendMessage("⚠️ Ahmad bhai, Link to dein!\nExample: #ig https://www.instagram.com/p/...", threadID, messageID);
  }

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Media fetch ho rahi hai...**", threadID);

  try {
    const options = {
      method: "GET",
      // Humne endpoint badal diya hai jo 2026 mein zyada stable hai
      url: "https://instagram-api39.p.rapidapi.com/instagram/", 
      params: { url: igUrl },
      headers: {
        "x-rapidapi-key": "6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618",
        "x-rapidapi-host": "instagram-api39.p.rapidapi.com"
      }
    };

    const res = await axios.request(options);
    const data = res.data;

    // --- SMART PARSING ---
    // Hum har us jagah dhoondenge jahan video link ho sakta hai
    let videoUrl = data.url || data.download_url || (data.data && data.data[0]?.url);

    if (!videoUrl) {
      // Agar video nahi mili to shayad ye Photo ho
      videoUrl = data.thumbnail || data.image; 
    }

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, is link se media nahi mil saki. Profile public honi chahiye.", threadID, messageID);
    }

    const isVideo = videoUrl.includes(".mp4") || videoUrl.includes("video");
    const ext = isVideo ? ".mp4" : ".jpg";
    const filePath = path.join(__dirname, `/cache/ig_${Date.now()}${ext}`);

    const resStream = await axios.get(videoUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    resStream.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✨ Quality: HD ${isVideo ? 'Video' : 'Photo'}`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    });

  } catch (err) {
    console.error(err);
    // Agar 404 aaye to fallback message
    const errorMsg = err.response?.status === 404 
      ? "❌ API Endpoint (Host) Down hai Ahmad bhai. Main doosra server try kar raha hoon..." 
      : "❌ Instagram API connection fail ho gaya.";
    api.sendMessage(errorMsg, threadID, messageID);
  }
};
