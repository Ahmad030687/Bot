/**
 * ig.js - Sardar RDX Pro API-39 Fix
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Fixed for result[0].url path and 404 Download Block
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "instagram",
  version: "40.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download IG Reels (Fixed Path for API-39)",
  commandCategory: "media",
  usages: "#ig [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) return api.sendMessage("⚠️ Ahmad bhai, link lazmi dein!", threadID, messageID);

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Extracting HD Video...**", threadID);

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

    // 🔥 FIXED PATH: Aapke log ke mutabiq exact rasta ye hai
    const videoUrl = data.result?.[0]?.url;

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, API ne response to diya par video link missing hai.", threadID, messageID);
    }

    const filePath = path.join(__dirname, `/cache/ig_${Date.now()}.mp4`);

    // 🔥 STEALTH DOWNLOAD: 404 Error se bachne ke liye headers
    try {
      const resStream = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
          'Accept': '*/*'
        }
      });

      const writer = fs.createWriteStream(filePath);
      resStream.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✅ Video Downloaded Successfully`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
      });

    } catch (downloadErr) {
      // Failover: Agar Render phir bhi block kare to direct link bhej do
      console.error("Download Blocked:", downloadErr.message);
      return api.sendMessage(`⚠️ **Server Blocked (404)!**\n\nInstagram ne video file download nahi karne di. Aap yahan se direct save kar lein:\n\n🔗 ${videoUrl}`, threadID, messageID);
    }

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Connection Error: API server busy hai.", threadID, messageID);
  }
};
