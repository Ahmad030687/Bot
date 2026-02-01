/**
 * tiktok.js - RapidAPI TikTok Downloader
 * Credits: Ahmad Ali Safdar | Sardar RDX
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "tiktok",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download TikTok video without watermark",
  commandCategory: "media",
  usages: "#tiktok [video_url]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const url = args.join(" ");

  if (!url) {
    return api.sendMessage("⚠️ Ahmad bhai, TikTok video ka link to dein!\nUsage: #tiktok [link]", threadID, messageID);
  }

  api.sendMessage("📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Video download ho rahi hai...**", threadID);

  // 🛠️ RapidAPI Configuration
  const options = {
    method: 'GET',
    url: 'https://tiktok-downloader-master-pro-no-watermark.p.rapidapi.com/v1/fetch',
    params: { url: url }, // User ka diya hua link yahan aayega
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618', // Aapki Key
      'x-rapidapi-host': 'tiktok-downloader-master-pro-no-watermark.p.rapidapi.com'
    }
  };

  try {
    // 1. API se Video Link mangwana
    const response = await axios.request(options);
    const data = response.data;

    // console.log(data); // Debugging ke liye (Agar video na aaye to isey on karein)

    // Different APIs ka structure alag hota hai, main common paths check kar raha hoon
    // Aksar ye 'data.play', 'url', ya 'data.no_watermark' mein hota hai
    const videoUrl = data.url || data.play || (data.data && data.data.play) || (data.data && data.data.url);

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, API ne video link nahi diya. Console check karein.", threadID, messageID);
    }

    // 2. Video Stream Download karna
    const filePath = path.join(__dirname, `/cache/tiktok_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoResponse = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream'
    });

    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      // 3. Video Send karna
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐓𝐈𝐊𝐓𝐎𝐊**\n✨ No Watermark Video`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Error: Ye Link galat hai ya API busy hai.", threadID, messageID);
  }
};
