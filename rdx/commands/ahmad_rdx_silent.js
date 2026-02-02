/**
 * ahmad_rdx_universal.js - Render Optimized Silent Downloader
 * Branding: 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗
 * Fixes: Port Binding & 404 CDN Block
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');

module.exports.config = {
  name: "ahmad_rdx_universal",
  version: "150.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Universal Silent Engine for Render",
  commandCategory: "media",
  usages: "Send Link",
  cooldowns: 1
};

// --- 🛠️ RENDER PORT FIX (Dummy Server) ---
// Is se Render ka "No open ports" wala masla khatam ho jayega
if (!global.portFixer) {
    const port = process.env.PORT || 3000;
    http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 AI is Running...\n');
    }).listen(port);
    global.portFixer = true;
}

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body || typeof body !== "string") return;

  const API_KEY = '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618';
  const urlLower = body.toLowerCase();

  // 🕵️ Auto Detection
  const isFB = urlLower.includes("facebook.com") || urlLower.includes("fb.watch");
  const isIG = urlLower.includes("instagram.com");
  const isTT = urlLower.includes("tiktok.com");

  if (!isFB && !isIG && !isTT) return;

  try {
    let videoUrl = "";

    // --- 🔵 FACEBOOK ---
    if (isFB) {
      const p = new URLSearchParams(); p.append('url', body);
      const res = await axios.post('https://facebook-video-downloader-2026.p.rapidapi.com/index.php', p, {
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

    if (!videoUrl) return;

    // --- 🚀 STEALTH DOWNLOADER ---
    const filePath = path.join(__dirname, `/cache/ahmad_${Date.now()}.mp4`);
    const stream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.google.com/',
        'Accept': '*/*'
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

    writer.on('error', () => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath); });

  } catch (err) {
    // Console mein bhi error nahi dikhayega agar aap chahte hain
    // console.log("Silent Error"); 
  }
};

module.exports.run = async ({ api, event }) => {
    api.sendMessage("🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 Universal Active.**", event.threadID);
};
