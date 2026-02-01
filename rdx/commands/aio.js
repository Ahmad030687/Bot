/**
 * aio.js - Sardar RDX Universal Downloader
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Supports: TikTok, Instagram, Facebook (All-in-One)
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "aio",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Any Video (FB/Insta/TikTok)",
  commandCategory: "media",
  usages: "#aio [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) {
    return api.sendMessage("⚠️ Ahmad bhai, Link to dein!\nUsage: #aio [video_link]", threadID, messageID);
  }

  api.sendMessage("🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Universal Engine Running...**", threadID);

  // 🛠️ RapidAPI Configuration (Aapka diya hua code)
  const options = {
    method: 'GET',
    url: 'https://all-in-one-video-downloader-api-tiktok-ig-fb.p.rapidapi.com/all-downloader',
    params: { url: link }, // User ka link yahan aayega
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'all-in-one-video-downloader-api-tiktok-ig-fb.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // console.log("API Response:", JSON.stringify(data, null, 2)); // Debugging ke liye

    // --- SMART EXTRACTION LOGIC ---
    // Har API ka format alag hota hai, hum sab try karenge
    // Ye API aksar 'videoUrl', 'url', ya 'data.play' deti hai
    const videoUrl = data.url || 
                     data.videoUrl || 
                     (data.data && data.data.play) || 
                     (data.data && data.data.video_url);

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, is API ne video link nahi diya. Shayad private account hai.", threadID, messageID);
    }

    // --- DOWNLOAD PROCESS ---
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
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐀𝐈𝐎**\n✨ Download Complete`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Error: Ye API shayad abhi busy hai ya link support nahi kar rahi.", threadID, messageID);
  }
};
