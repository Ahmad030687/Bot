/**
 * ig.js - Sardar RDX Anti-404 Hybrid
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Forced Video Extraction + Direct Link Fallback
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ig",
  version: "20.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download IG Reels (Fixes 404 & Thumbnail-only issues)",
  commandCategory: "media",
  usages: "#ig [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const igUrl = args[0];

  if (!igUrl) return api.sendMessage("⚠️ Ahmad bhai, Instagram Reel link to dein!", threadID, messageID);

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Bypassing Instagram CDN...**", threadID);

  try {
    // --- ENGINE 1: RapidAPI (Ahmad's Key) ---
    const options = {
      method: 'GET',
      url: 'https://instagram-video-image-downloader.p.rapidapi.com/igdl',
      params: { url: igUrl },
      headers: {
        'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
        'x-rapidapi-host': 'instagram-video-image-downloader.p.rapidapi.com'
      }
    };

    const res = await axios.request(options);
    const data = res.data;
    let videoUrl = "";

    // --- STRICT VIDEO SCANNER ---
    // Hum poore response mein sirf '.mp4' ya video file dhoondeinge
    if (Array.isArray(data)) {
        const videoObj = data.find(item => item.url.includes(".mp4") || item.type === "video");
        videoUrl = videoObj ? videoObj.url : null;
    } else if (data.links) {
        const videoObj = data.links.find(l => l.link.includes(".mp4") || l.type === "video");
        videoUrl = videoObj ? videoObj.link : null;
    }

    // --- ENGINE 2: PUBLIC FALLBACK (If RapidAPI returns image or fails) ---
    if (!videoUrl || !videoUrl.includes(".mp4")) {
      console.log("RapidAPI failed to provide video. Switching to Backup...");
      const backup = await axios.get(`https://api.vkrhost.xyz/api/v1/instagram?url=${encodeURIComponent(igUrl)}`);
      videoUrl = backup.data.result?.[0]?.url;
    }

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, Instagram ne is reel ka access block kar diya hai.", threadID, messageID);
    }

    // --- DOWNLOADER WITH MULTI-HEADERS ---
    const filePath = path.join(__dirname, `/cache/ig_${Date.now()}.mp4`);
    
    try {
      const resStream = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
          'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5'
        }
      });

      const writer = fs.createWriteStream(filePath);
      resStream.data.pipe(writer);

      writer.on('finish', () => {
        const stats = fs.statSync(filePath);
        // Agar file bohot choti hai, to matlab ye thumbnail (image) hai
        if (stats.size < 150000) {
          fs.unlinkSync(filePath);
          return api.sendMessage(`⚠️ **Render Server Block!**\n\nInstagram ne video file download nahi karne di. Aap yahan se direct download kar lein:\n\n🔗 Link: ${videoUrl}`, threadID, messageID);
        }

        api.sendMessage({
          body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✨ Status: HD Video Downloaded`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

    } catch (downloadErr) {
      // Agar 404 aaye to user ko direct link bhej do
      return api.sendMessage(`🚀 **Direct Access Mode**\n\nBot download nahi kar pa raha, par link mil gaya hai:\n\n📥 [Download Video](${videoUrl})`, threadID, messageID);
    }

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error: API Connection timeout.", threadID, messageID);
  }
};
