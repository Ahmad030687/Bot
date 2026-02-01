/**
 * ig.js - Instagram Downloader (Ahmad RDX Edition)
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Uses instagram-video-image-downloader API
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ig",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download IG Reels/Posts via New API",
  commandCategory: "media",
  usages: "#ig [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const igUrl = args[0];

  if (!igUrl) {
    return api.sendMessage("⚠️ Ahmad bhai, Instagram Reel ya Post ka link dein!\nUsage: #ig https://www.instagram.com/reel/xxx/", threadID, messageID);
  }

  api.sendMessage("📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Connecting to Server...**", threadID);

  // 🛠️ Aapka diya hua Configuration
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

    // --- DATA EXTRACTION ---
    // Ye API aksar data ko aik array mein daiti hai
    let mediaUrl = "";
    if (data.links && data.links.length > 0) {
        mediaUrl = data.links[0].link; // HD Link
    } else if (data.url) {
        mediaUrl = data.url;
    }

    if (!mediaUrl) {
      console.log("Full Response:", JSON.stringify(data, null, 2));
      return api.sendMessage("❌ Ahmad bhai, is API ne link return nahi kiya. Check if post is public.", threadID, messageID);
    }

    // Extension Check
    const ext = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg";
    const filePath = path.join(__dirname, `/cache/ig_new_${Date.now()}${ext}`);

    // --- DOWNLOAD & SEND ---
    const resStream = await axios.get(mediaUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    resStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✨ Success: Media Downloaded`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Error: API ne response nahi diya (404/Limit).", threadID, messageID);
  }
};
