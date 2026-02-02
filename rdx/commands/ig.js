/**
 * ig.js - Authenticated Instagram Downloader
 * Credits: Sardar RDX | Ahmad Ali
 * Logic: Uses provided session cookies to bypass 404/Thumbnail-only blocks.
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ig",
  version: "12.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Authenticated IG Downloader (Fixes 404 & Thumbnail-only issues)",
  commandCategory: "media",
  usages: "#ig [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const igUrl = args[0];

  if (!igUrl) return api.sendMessage("⚠️ Link lazmi dein!", threadID, messageID);

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Authenticating Session...**", threadID);

  // 1. Convert JSON Cookies to a String
  const cookieData = [
    { name: "csrftoken", value: "bGIDVDupMveNybZtdUnEtI" },
    { name: "datr", value: "uSKAadyUYea0BpWZdtL4f9Kx" },
    { name: "ig_did", value: "731C0210-4E78-4A23-B215-71BA1C49BF92" },
    { name: "mid", value: "aYAiuQABAAFPO0HzHIr7I-YaiHNX" }
  ];
  
  const cookieString = cookieData.map(c => `${c.name}=${c.value}`).join("; ");

  try {
    const options = {
      method: 'GET',
      url: 'https://instagram-video-image-downloader.p.rapidapi.com/igdl',
      params: { url: igUrl },
      headers: {
        'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
        'x-rapidapi-host': 'instagram-video-image-downloader.p.rapidapi.com',
        'Cookie': cookieString, // Injecting the cookies
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const response = await axios.request(options);
    const data = response.data;

    // Deep scanning for the video link (Array or Object)
    let mediaUrl = "";
    if (Array.isArray(data)) {
        mediaUrl = data[0]?.url || data[0]?.download_url;
    } else {
        mediaUrl = data.url || data.download_url || (data.links && data.links[0]?.link);
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Link nahi mila. Shayad video private hai.", threadID, messageID);
    }

    const ext = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg";
    const filePath = path.join(__dirname, `/cache/ig_auth_${Date.now()}${ext}`);
    
    // 2. Download with Auth Headers
    const resStream = await axios({
      url: mediaUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    });

    const writer = fs.createWriteStream(filePath);
    resStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀 (Auth Mode)**\n✅ Session Verified`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error("Auth Error:", error.message);
    api.sendMessage("❌ Session expired ya 404 error. Naye cookies try karein.", threadID, messageID);
  }
};
