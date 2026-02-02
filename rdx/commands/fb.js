/**
 * fb.js - Facebook Video Downloader (2026 Pro)
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: POST Method with x-www-form-urlencoded
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "fb",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Facebook Videos (HD)",
  commandCategory: "media",
  usages: "#fb [video_link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) return api.sendMessage("⚠️ Ahmad bhai, Facebook video ka link to dein!", threadID, messageID);

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Connecting to FB Pro Engine...**", threadID);

  // 🛠️ POST Parameters Set-up
  const encodedParams = new URLSearchParams();
  encodedParams.append('url', link); // Aapka link yahan fit ho gaya

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

    // --- SMART EXTRACTION ---
    // FB APIs aksar HD ya SD links daiti hain. Hum HD ko priority dein ge.
    const videoUrl = data.hd || data.url || (data.result && data.result.hd) || (data.links && data.links[0]?.url);

    if (!videoUrl) {
      console.log("Raw Response:", JSON.stringify(data, null, 2));
      return api.sendMessage("❌ Ahmad bhai, is API ne video link nahi diya. Check console logs.", threadID, messageID);
    }

    const filePath = path.join(__dirname, `/cache/fb_${Date.now()}.mp4`);

    // --- PROTECTED DOWNLOADER ---
    const resStream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.facebook.com/'
      }
    });

    const writer = fs.createWriteStream(filePath);
    resStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊**\n✨ Done Ahmad bhai! HD Video Ready.`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ FB API Connection Error. Check your RapidAPI Dashboard.", threadID, messageID);
  }
};

