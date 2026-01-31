/**
 * rdx_autosave.js
 * 100% Stable | Render Cloud Optimized | No API Key
 * Supports: TikTok, Insta, FB, YT Shorts
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

// ================= CONFIG =================
const MAX_MB = 25; // Facebook limit
const USER_COOLDOWN = 6000; // 6 seconds safety
const cooldownMap = new Map();

module.exports = async function autosave({ api, event }) {
  try {
    const { body, threadID, messageID, senderID } = event;
    if (!body || senderID == api.getCurrentUserID()) return;

    // 1. Link Detection
    const urlRegex = /(https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|instagram\.com|facebook\.com|fb\.watch|youtube\.com\/shorts|reels|x\.com|twitter\.com)\/\S+)/gi;
    const match = body.match(urlRegex);
    if (!match) return;

    const url = match[0];

    // 2. Cooldown Check (Ahmad Ali Safety)
    const now = Date.now();
    const last = cooldownMap.get(senderID) || 0;
    if (now - last < USER_COOLDOWN) return;
    cooldownMap.set(senderID, now);

    api.sendTypingIndicator(threadID);

    // 3. Multi-Server Fetching (2026 Fresh)
    const servers = [
      `https://kaiz-apis.gleeze.com/api/video-downloader?url=${encodeURIComponent(url)}`,
      `https://api.agatz.xyz/api/allvideodl?url=${encodeURIComponent(url)}`
    ];

    let videoData = null;
    for (let server of servers) {
      try {
        const res = await axios.get(server, { timeout: 15000 });
        videoData = res.data.video || res.data.result?.url || res.data.data?.url;
        if (videoData) break;
      } catch (e) { continue; }
    }

    if (!videoData) return;

    // 4. Render Safe Path
    const tempFile = path.join(os.tmpdir(), `rdx_${Date.now()}.mp4`);

    const response = await axios({ url: videoData, method: 'GET', responseType: 'stream' });
    const writer = fs.createWriteStream(tempFile);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', async () => {
        const stats = fs.statSync(tempFile);
        
        if (stats.size > 26214400) { // 25MB
          fs.unlinkSync(tempFile);
          return resolve();
        }

        api.sendMessage({
          body: "🎬 **SARDAR RDX AUTO-DL**",
          attachment: fs.createReadStream(tempFile)
        }, threadID, () => {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }, messageID);
        resolve();
      });
      writer.on("error", resolve);
    });

  } catch (e) {
    console.log("[RDX-AUTOSAVE-ERROR]", e.message);
  }
};
