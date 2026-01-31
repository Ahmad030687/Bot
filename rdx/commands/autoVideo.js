/**
 * autoVideo.js - Smart Limit Handler (2026 Ready)
 * Optimized for Ahmad Ali Safdar
 */

module.exports.config = {
  name: "autoVideo",
  version: "21.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Bypasses 429 errors by switching sources",
};

module.exports.handleEvent = async ({ api, event }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');
  const os = require('os');

  const { body, threadID, messageID, senderID } = event;
  if (senderID == api.getCurrentUserID() || !body) return;

  const tiktokRegex = /(https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/\S+)/gi;
  const match = body.match(tiktokRegex);

  if (match) {
    let targetLink = match[0];
    api.sendTypingIndicator(threadID);

    let videoUrl = null;

    // --- STRATEGY 1: RapidAPI V4 (Ahmad's Key) ---
    try {
      const res = await axios.get('https://tiktok-video-audio-downloader4.p.rapidapi.com/', {
        params: { url: targetLink },
        headers: {
          'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
          'x-rapidapi-host': 'tiktok-video-audio-downloader4.p.rapidapi.com'
        },
        timeout: 5000
      });
      videoUrl = res.data.data?.play || res.data.url;
    } catch (err) {
      console.log("RapidAPI 429 or Timeout. Moving to Strategy 2...");
    }

    // --- STRATEGY 2: Global Public API (Fallback) ---
    if (!videoUrl) {
      try {
        const backup = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(targetLink)}`);
        videoUrl = backup.data.video?.no_watermark || backup.data.url;
      } catch (e) {
        return api.sendMessage("❌ Ahmad bhai, saare servers ki limit full ho chuki hai!", threadID, messageID);
      }
    }

    if (videoUrl) {
      const tempFile = path.join(os.tmpdir(), `rdx_smart_${Date.now()}.mp4`);
      try {
        const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
        const writer = fs.createWriteStream(tempFile);
        response.data.pipe(writer);

        writer.on('finish', () => {
          api.sendMessage({
            body: "🦅 **SARDAR RDX SMART DL**\n✨ Server: Auto-Switched",
            attachment: fs.createReadStream(tempFile)
          }, threadID, () => {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          }, messageID);
        });
      } catch (e) { console.log("Stream error."); }
    }
  }
};

module.exports.run = async () => {};
