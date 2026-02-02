/**
 * ahmad_rdx_universal.js - Silent Auto-Downloader
 * Branding: 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗
 * Support: FB, IG, TikTok (Auto-Detect)
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ahmad_rdx_universal",
  version: "100.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Silent Multi-Downloader (No Commands Needed)",
  commandCategory: "media",
  usages: "Direct Link",
  cooldowns: 2
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const API_KEY = '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618';
  const url = body;
  const urlLower = url.toLowerCase();

  // 🕵️ Detection Logic
  const isFB = urlLower.includes("facebook.com") || urlLower.includes("fb.watch");
  const isIG = urlLower.includes("instagram.com");
  const isTT = urlLower.includes("tiktok.com");

  if (!isFB && !isIG && !isTT) return;

  // No "Fetching" message - Just silent work
  try {
    let videoUrl = "";

    // --- 🔵 FACEBOOK (POST Engine) ---
    if (isFB) {
      const params = new URLSearchParams();
      params.append('url', url);
      const res = await axios.post('https://facebook-video-downloader-2026.p.rapidapi.com/index.php', params, {
        headers: { 
            'x-rapidapi-key': API_KEY, 
            'x-rapidapi-host': 'facebook-video-downloader-2026.p.rapidapi.com',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      videoUrl = res.data.result?.sourceHd || res.data.result?.sourceSd;
    }

    // --- 📸 INSTAGRAM (API-39 Engine) ---
    else if (isIG) {
      const res = await axios.get('https://instagram-api39.p.rapidapi.com/instagram/', {
        params: { url: url },
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'instagram-api39.p.rapidapi.com' }
      });
      videoUrl = res.data.result?.[0]?.url;
    }

    // --- 🎵 TIKTOK (Master Pro Engine) ---
    else if (isTT) {
      const res = await axios.get('https://tiktok-downloader-master-pro-no-watermark.p.rapidapi.com/v1/fetch', {
        params: { url: url },
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'tiktok-downloader-master-pro-no-watermark.p.rapidapi.com' }
      });
      videoUrl = res.data.url || res.data.play || res.data.hdplay;
    }

    if (!videoUrl) return; // Silent exit if no link found

    // --- DOWNLOAD & STREAM ---
    const filePath = path.join(__dirname, `/cache/ahmad_${Date.now()}.mp4`);
    const stream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': isFB ? 'https://www.facebook.com/' : 'https://www.instagram.com/'
      }
    });

    const writer = fs.createWriteStream(filePath);
    stream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);
    });

    writer.on('error', () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

  } catch (err) {
    // 🤫 NO ERROR MESSAGE - Keep it professional
    console.log("Ahmad RDX Universal Engine: Silent Catch triggered.");
  }
};

module.exports.run = async ({ api, event }) => {
    // Ye tab chale ga jab koi command manually type kare
    api.sendMessage("🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 AI Engine Active.**\n\nBas koi bhi link send karein, main bina kuch bolay video download kar doon ga.", event.threadID);
};
