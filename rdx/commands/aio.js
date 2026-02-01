/**
 * aio.js - All In One Social Media Downloader
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Supports: Facebook, Instagram, TikTok, Twitter, Pinterest
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "aio",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download video from Any Social Media (FB, Insta, TikTok)",
  commandCategory: "media",
  usages: "#aio [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const url = args.join(" ");

  if (!url) {
    return api.sendMessage("⚠️ Ahmad bhai, koi link to dein!\nUsage: #aio [fb/insta/tiktok link]", threadID, messageID);
  }

  api.sendMessage("🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Universal Downloader Running...**", threadID);

  // 🛠️ RapidAPI Configuration (Corrected Endpoint)
  // Hum '/progress' ki jagah '/api/download' use kar rahe hain
  const options = {
    method: 'GET',
    url: 'https://social-media-video-downloader-api1.p.rapidapi.com/api/download',
    params: { url: url },
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'social-media-video-downloader-api1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // console.log("AIO Response:", JSON.stringify(data, null, 2)); // Debugging

    // --- SMART LINK EXTRACTOR ---
    // Ye API aksar 'url', 'video_url', ya 'download_url' mein link deti hai
    // Hum sab check karenge taake miss na ho
    const videoUrl = data.url || 
                     (data.data && data.data.video_url) || 
                     (data.data && data.data.url) ||
                     data.link;

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, is link se video nahi mili. Privacy settings check karein.", threadID, messageID);
    }

    // --- DOWNLOAD STREAM ---
    const filePath = path.join(__dirname, `/cache/aio_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoStream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream'
    });

    videoStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐀𝐈𝐎**\n✨ Source: Social Media API`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Error: Ye API link support nahi kar rahi ya server busy hai.", threadID, messageID);
  }
};

