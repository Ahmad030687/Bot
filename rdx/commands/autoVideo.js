#adc autoVideo.js module.exports.config = {
  name: "autoVideo",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Auto Video DL - Fixed 404 & TikTok Redirects",
};

module.exports.handleEvent = async ({ api, event }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');

  const { body, threadID, messageID, senderID } = event;
  if (senderID == api.getCurrentUserID() || !body) return;

  const linkMatch = body.match(/(https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|instagram\.com|facebook\.com|fb\.watch|youtube\.com\/shorts|reels|x\.com|twitter\.com)\/\S+)/gi);

  if (linkMatch) {
    const targetLink = linkMatch[0];
    api.sendTypingIndicator(threadID);

    // 2026 Multi-Engine APIs (TikTok Specially Optimized)
    const servers = [
      `https://kaiz-apis.gleeze.com/api/tiktok-dl?url=${encodeURIComponent(targetLink)}`,
      `https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(targetLink)}`,
      `https://api.samir.site/download/tiktok?url=${encodeURIComponent(targetLink)}`,
      `https://kaiz-apis.gleeze.com/api/video-downloader?url=${encodeURIComponent(targetLink)}`
    ];

    let videoUrl = null;
    let title = "Sardar RDX Download";

    for (let server of servers) {
      try {
        const res = await axios.get(server, { timeout: 15000 });
        // TikTok Optimized Response Check
        videoUrl = res.data.video || res.data.data?.play || res.data.result?.url || res.data.data?.video;
        if (videoUrl) {
          title = res.data.title || res.data.data?.title || "No Title";
          break; 
        }
      } catch (e) { continue; }
    }

    if (!videoUrl) return; // Agar sab fail ho jayein to chup raho

    try {
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `rdx_vid_${Date.now()}.mp4`);

      const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve) => {
        writer.on('finish', () => {
          const stats = fs.statSync(filePath);
          if (stats.size > 26214400) { 
            fs.unlinkSync(filePath);
            api.sendMessage("⚠️ Video 25MB se bari hai, Facebook limit!", threadID, messageID);
            return resolve();
          }

          api.sendMessage({
            body: `🎬 **SARDAR RDX - TIKTOK FIXED**\n✨ ${title}`,
            attachment: fs.createReadStream(filePath)
          }, threadID, () => fs.unlinkSync(filePath), messageID);
          resolve();
        });
      });
    } catch (err) { console.log(err); }
  }
};

module.exports.run = async () => {};
