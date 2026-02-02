/**
 * ig.js - Instagram Pro Downloader (API-39)
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Detailed JSON parsing for Video vs Image
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ig",
  version: "39.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download IG Media using API-39",
  commandCategory: "media",
  usages: "#ig [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link) return api.sendMessage("⚠️ Ahmad bhai, link lazmi dein!", threadID, messageID);

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Fetching from Pro API-39...**", threadID);

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

    // --- SMART EXTRACTION ---
    // API-39 aksar 'url', 'download_url' ya 'video_link' deti hai
    let mediaUrl = data.url || data.download_url || (data.data && data.data[0]?.url);

    if (!mediaUrl) {
      console.log("Raw Response:", JSON.stringify(data, null, 2));
      return api.sendMessage("❌ Ahmad bhai, API ne media link nahi diya. Check console logs.", threadID, messageID);
    }

    // Checking if it's a video or image
    const isVideo = mediaUrl.includes(".mp4") || (data.type && data.type === 'video');
    const ext = isVideo ? ".mp4" : ".jpg";
    const filePath = path.join(__dirname, `/cache/ig_${Date.now()}${ext}`);

    // --- PROTECTED DOWNLOADER ---
    try {
      const resStream = await axios({
        url: mediaUrl,
        method: 'GET',
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/'
        }
      });

      const writer = fs.createWriteStream(filePath);
      resStream.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✨ Quality: HD ${isVideo ? 'Video' : 'Photo'}`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

    } catch (downloadErr) {
      // 🚀 FAILOVER: Agar Render block ho jaye to direct link bhej do
      return api.sendMessage(`⚠️ **Download Blocked!**\n\nInstagram ne server ko file nahi di (404). Aap yahan se direct download karein:\n\n🔗 [Download Media](${mediaUrl})`, threadID, messageID);
    }

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ API-39 Connection Error. Plan check karein.", threadID, messageID);
  }
};
