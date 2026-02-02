/**
 * fb.js - Sardar RDX Facebook HD Fix
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Fixed for result.sourceHd path & 404 Protection
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "facebook",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Facebook HD Videos (Fixed Path)",
  commandCategory: "media",
  usages: "#fb [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) return api.sendMessage("⚠️ Ahmad bhai, FB link to dein!", threadID, messageID);

  api.sendMessage("📥 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Fetching HD Video from FB...**", threadID);

  const encodedParams = new URLSearchParams();
  encodedParams.append('url', link);

  const options = {
    method: 'POST',
    url: 'https://facebook-video-downloader-2026.p.rapidapi.com/index.php',
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'facebook-video-downloader-2026.p.rapidapi.com',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: encodedParams
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // 🔥 FIXED PATH: Aapke response ke mutabiq exact rasta ye hai
    // Pehle HD try karega, agar nahi mili to SD uthayega
    const videoUrl = data.result?.sourceHd || data.result?.sourceSd;
    const title = data.result?.title || "Facebook Video";

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, is video ka link block hai ya API response khali hai.", threadID, messageID);
    }

    const filePath = path.join(__dirname, `/cache/fb_${Date.now()}.mp4`);

    // 🔥 STEALTH DOWNLOAD: Facebook CDN 404 error se bachne ke liye headers
    const resStream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.facebook.com/'
      }
    });

    const writer = fs.createWriteStream(filePath);
    resStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊**\n\n📝 **Title:** ${title}\n✨ **Quality:** HD Supported`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ FB Engine Error: Link expire ho chuka hai.", threadID, messageID);
  }
};
