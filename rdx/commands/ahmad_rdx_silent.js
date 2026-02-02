/**
 * ahmad_rdx_silent.js - Universal Silent Auto-Downloader
 * Branding: 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗
 * Logic: No Status Messages, No Error Spam, Just Video.
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ahmad_rdx_silent",
  version: "60.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Silent Auto-Downloader (FB/IG/TT)",
  commandCategory: "media",
  usages: "Send link directly",
  cooldowns: 1
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const API_KEY = '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618';
  const msg = body.toLowerCase();

  // 🕵️ Platform Detection (FB, IG, TikTok)
  const isFB = msg.includes("facebook.com") || msg.includes("fb.watch");
  const isIG = msg.includes("instagram.com");
  const isTT = msg.includes("tiktok.com");

  if (!isFB && !isIG && !isTT) return;

  // Bot ab yahan se khamoshi se kaam shuru karega (No "Fetching" message)

  try {
    let videoUrl = "";

    // --- 🔵 FACEBOOK ---
    if (isFB) {
      const params = new URLSearchParams();
      params.append('url', body);
      const res = await axios.post('https://facebook-video-downloader-2026.p.rapidapi.com/index.php', params, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'facebook-video-downloader-2026.p.rapidapi.com' }
      });
      videoUrl = res.data.result?.sourceHd || res.data.result?.sourceSd;
    }

    // --- 📸 INSTAGRAM ---
    else if (isIG) {
      const res = await axios.get('https://instagram-api39.p.rapidapi.com/instagram/', {
        params: { url: body },
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'instagram-api39.p.rapidapi.com' }
      });
      videoUrl = res.data.result?.[0]?.url;
    }

    // --- 🎵 TIKTOK ---
    else if (isTT) {
      const res = await axios.get('https://tiktok-downloader-master-pro-no-watermark.p.rapidapi.com/v1/fetch', {
        params: { url: body },
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'tiktok-downloader-master-pro-no-watermark.p.rapidapi.com' }
      });
      videoUrl = res.data.url || res.data.play;
    }

    // Agar link nahi milta to bot khamosh rahega (Silent Exit)
    if (!videoUrl) return;

    // --- DOWNLOAD & SEND ---
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
      // 🦅 Sirf video bhejte waqt name show hoga
      api.sendMessage({
        body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (e) {
    // Error aane par bot bilkul khamosh rahega, user ko kuch pata nahi chalega
    console.log("Silent Error Log:", e.message);
  }
};

// Load hone par aik bar confirmation ke liye
module.exports.run = async ({ api, event }) => {
    api.sendMessage("🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 AI Active.**\nSilent mode on hai. Bas link bhejein!", event.threadID);
};

