module.exports.config = {
  name: "autoVideo",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Auto Video Downloader with Multi-Server Support",
};

module.exports.handleEvent = async ({ api, event }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');

  const { body, threadID, messageID, senderID } = event;
  if (senderID == api.getCurrentUserID() || !body) return;

  // 2026 Updated Link Detector
  const videoLinkPattern = /(https?:\/\/(?:www\.)?(?:tiktok\.com|instagram\.com|facebook\.com|fb\.watch|youtube\.com\/shorts|reels|x\.com|twitter\.com|pin\.it)\/\S+)/gi;
  const link = body.match(videoLinkPattern);

  if (link) {
    const targetLink = link[0];
    api.sendTypingIndicator(threadID);

    // List of Free APIs (2026 Fresh)
    const servers = [
      `https://kaiz-apis.gleeze.com/api/video-downloader?url=${encodeURIComponent(targetLink)}`,
      `https://api.agatz.xyz/api/allvideodl?url=${encodeURIComponent(targetLink)}`,
      `https://api.samir.site/download/aio?url=${encodeURIComponent(targetLink)}`
    ];

    let videoUrl = null;
    let title = "Sardar RDX Download";

    // --- SERVER SELECTION LOGIC ---
    for (let server of servers) {
      try {
        const res = await axios.get(server, { timeout: 10000 });
        // Check different API response structures
        videoUrl = res.data.video || res.data.result?.url || res.data.data?.url;
        if (videoUrl) {
            title = res.data.title || res.data.result?.title || title;
            break; // Server mil gaya, loop roko
        }
      } catch (e) { continue; } // Agle server par jao
    }

    if (!videoUrl) {
      // Agar kisi server ne kaam nahi kiya to chup raho (ya admin ko error do)
      return console.log("All servers failed for: " + targetLink);
    }

    try {
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

      const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve) => {
        writer.on('finish', () => {
          const stats = fs.statSync(filePath);
          if (stats.size > 26214400) { // 25MB Limit
            fs.unlinkSync(filePath);
            api.sendMessage("⚠️ File too large (25MB+) for Facebook.", threadID, messageID);
            return resolve();
          }

          api.sendMessage({
            body: `🦅 **SARDAR RDX AUTO-DL**\n✨ ${title}`,
            attachment: fs.createReadStream(filePath)
          }, threadID, () => fs.unlinkSync(filePath), messageID);
          resolve();
        });
      });

    } catch (err) {
      console.log("Download Error: " + err.message);
    }
  }
};

module.exports.run = async () => {};
