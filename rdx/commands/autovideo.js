/**
 * autoVideo.js - THE UNIVERSAL SILENT HUB
 * Branding: 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗
 * Logic: Triple-Isolated Engine (Render Optimized)
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const http = require("http");

module.exports.config = {
  name: "autoVideo",
  version: "100.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Silent Auto-Downloader (Isolated Engines)",
};

// --- 🛠️ RENDER PORT FIX ---
if (!global.portFixer) {
  const port = process.env.PORT || 3000;
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 Engine is Active 🎉');
  }).listen(port);
  global.portFixer = true;
}

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body || typeof body !== "string") return;

  const API_KEY = '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618';
  const url = body.trim(); // Clean link

  try {
    let videoUrl = null;
    let referer = "https://www.google.com/";

    // ================= 🔵 FACEBOOK (POST Logic) =================
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
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
      referer = "https://www.facebook.com/";
    }

    // ================= 📸 INSTAGRAM (API-39 Logic) =================
    else if (url.includes("instagram.com")) {
      const res = await axios.get('https://instagram-api39.p.rapidapi.com/instagram/', {
        params: { url: url },
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'instagram-api39.p.rapidapi.com' }
      });
      videoUrl = res.data.result?.[0]?.url;
      referer = "https://www.instagram.com/";
    }

    // ================= 🎵 TIKTOK (Master Pro Logic) =================
    else if (url.includes("tiktok.com")) {
      const res = await axios.get('https://tiktok-downloader-master-pro-no-watermark.p.rapidapi.com/v1/fetch', {
        params: { url: url },
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'tiktok-downloader-master-pro-no-watermark.p.rapidapi.com' }
      });
      videoUrl = res.data.url || res.data.play;
    }

    // AGAR VIDEO NA MILAY TO CHUP-CHAAP EXIT
    if (!videoUrl) return;

    // ================= STEALTH DOWNLOAD =================
    const filePath = path.join(__dirname, `/cache/rdx_${Date.now()}.mp4`);
    const response = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': referer
      }
    }).catch(() => null);

    if (!response) return;

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: "🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);
    });

    writer.on('error', () => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath); });

  } catch (e) {
    // BILKUL KHAMOSHI (No logs, No chat messages)
  }
};

module.exports.run = async ({ api, event }) => { };
