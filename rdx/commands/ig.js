/**
 * ig.js - Sardar RDX Array-Fix Edition
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Fixed for Array-based JSON and Download Headers
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ig",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Instagram Reels/Posts (Fixed Path)",
  commandCategory: "media",
  usages: "#ig <link>",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const igUrl = args[0];

  if (!igUrl) return api.sendMessage("⚠️ Ahmad bhai, Link lazmi dein!", threadID, messageID);

  api.sendMessage("📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Array Path Scanning...**", threadID);

  const options = {
    method: 'GET',
    url: 'https://instagram-video-image-downloader.p.rapidapi.com/igdl',
    params: { url: igUrl },
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'instagram-video-image-downloader.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // 🔥 FIXED EXTRACTION: Aapka data Array hai, isliye data[0] use kiya hai
    const mediaUrl = data[0]?.url || data[0]?.download_url;

    if (!mediaUrl) {
      console.log("Structure Check:", data);
      return api.sendMessage("❌ Ahmad bhai, API ne response to diya par format match nahi kiya.", threadID, messageID);
    }

    const ext = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg";
    const filePath = path.join(__dirname, `/cache/ig_${Date.now()}${ext}`);
    
    // 🔥 FIXED DOWNLOAD: Headers add kiye hain taake 404 Error na aaye
    const resStream = await axios({
      url: mediaUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const writer = fs.createWriteStream(filePath);
    resStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✅ Path: Array[0].url`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error.message);
    api.sendMessage("❌ Server Error: Link expire ho chuka hai ya API limit khatam.", threadID, messageID);
  }
};
