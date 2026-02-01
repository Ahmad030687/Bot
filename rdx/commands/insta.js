/**
 * insta.js - Instagram Media Downloader (HD)
 * Credits: Ahmad Ali Safdar | Sardar RDX
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "insta",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Instagram Reels, Videos, and Photos",
  commandCategory: "media",
  usages: "#insta [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) {
    return api.sendMessage("⚠️ Ahmad bhai, Instagram link to dein!\nUsage: #insta [link]", threadID, messageID);
  }

  api.sendMessage("📸 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Instagram media fetch ho rahi hai...**", threadID);

  // 🛠️ RapidAPI Configuration (Aapki key ke sath)
  const options = {
    method: 'GET',
    url: 'https://instagram-api39.p.rapidapi.com/instagram/',
    params: { url: link },
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'instagram-api39.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // --- SMART MEDIA EXTRACTION ---
    // Instagram APIs aksar 'url', 'download_url', ya 'data' array mein link daiti hain
    let mediaUrl = data.url || data.download_url || (data.data && data.data[0]?.url);

    if (!mediaUrl) {
      console.log("API Response:", JSON.stringify(data, null, 2));
      return api.sendMessage("❌ Ahmad bhai, media link nahi mila. Post public honi chahiye!", threadID, messageID);
    }

    // Extension check (Video ya Image)
    const isVideo = mediaUrl.includes(".mp4") || mediaUrl.includes("video");
    const ext = isVideo ? ".mp4" : ".jpg";
    const filePath = path.join(__dirname, `/cache/insta_${Date.now()}${ext}`);

    // --- DOWNLOAD & SEND ---
    const mediaRes = await axios({
      url: mediaUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    mediaRes.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✨ Quality: HD ${isVideo ? 'Video' : 'Photo'}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Link expire ho chuka hai ya API server busy hai.", threadID, messageID);
  }
};
