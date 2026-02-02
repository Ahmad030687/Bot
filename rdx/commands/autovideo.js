/**
 * autoVideo.js - UNIVERSAL AUTO LINK DOWNLOADER
 * Branding: 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗
 * Mode: NO COMMAND | NO ERROR MESSAGE | RENDER OPTIMIZED
 * Credits: Ahmad Ali Safdar
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const http = require("http");

module.exports.config = {
  name: "autoVideo",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Silent Auto-Downloader (FB/IG/TT)",
};

// --- 🛠️ RENDER STABILITY (DUMMY SERVER) ---
// Is se Render ka 'No open ports' wala masla aur restart hona khatam ho jayega
if (!global.portFixer) {
  const port = process.env.PORT || 3000;
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 AI Engine is Live 🎉');
  }).listen(port);
  global.portFixer = true;
}

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body || typeof body !== "string") return;

  // Link detect karne ka tarika
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = body.match(urlRegex);
  if (!match) return;

  const url = match[0];
  const API_KEY = '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618';
  let videoUrl = null;

  try {
    /* ================= TIKTOK (Verified) ================= */
    if (url.includes("tiktok.com")) {
      const res = await axios.get("https://tiktok-downloader-master-pro-no-watermark.p.rapidapi.com/v1/fetch", {
        params: { url },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "tiktok-downloader-master-pro-no-watermark.p.rapidapi.com",
        },
      });
      videoUrl = res.data?.url || res.data?.play || res.data?.data?.play;
    }

    /* ================= INSTAGRAM (API-39 Verified) ================= */
    else if (url.includes("instagram.com")) {
      const res = await axios.get("https://instagram-api39.p.rapidapi.com/instagram/", {
        params: { url },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "instagram-api39.p.rapidapi.com",
        },
      });
      videoUrl = res.data?.result?.[0]?.url;
    }

    /* ================= FACEBOOK (2026 POST Verified) ================= */
    else if (url.includes("facebook.com") || url.includes("fb.watch")) {
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

    if (!videoUrl) return; // Silent Exit

    /* ================= STEALTH DOWNLOAD ================= */
    const filePath = path.join(__dirname, `/cache/rdx_${Date.now()}.mp4`);

    const stream = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Referer": url.includes("facebook") ? "https://www.facebook.com/" : "https://www.instagram.com/",
      },
    }).catch(() => null);

    if (!stream) return;

    const writer = fs.createWriteStream(filePath);
    stream.data.pipe(writer);

    writer.on("finish", () => {
      // Size Check: 25MB limit for Messenger
      const stats = fs.statSync(filePath);
      if (stats.size > 26214400) {
          fs.unlinkSync(filePath);
          return; // Too big, silent exit
      }

      api.sendMessage({
          body: "🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**",
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); },
        messageID
      );
    });

    writer.on("error", () => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); });

  } catch (e) {
    // 🤫 BILKUL CHUP (Silent Catch)
  }
};

module.exports.run = async ({ api, event }) => {
    // Ye function sirf command load hone ke liye hai
};
