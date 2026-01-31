/**
 * autoVideo.js - 2026 Ultra-Stable Version
 * Fixed: 404 Redirects & TikTok vt.tiktok
 */

module.exports.config = {
  name: "autoVideo",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Final 404 Fix with Redirect Resolver",
};

module.exports.handleEvent = async ({ api, event }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');
  const os = require('os');

  const { body, threadID, messageID, senderID } = event;
  if (senderID == api.getCurrentUserID() || !body) return;

  const linkMatch = body.match(/(https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|instagram\.com|facebook\.com|fb\.watch|youtube\.com\/shorts|reels|x\.com|twitter\.com)\/\S+)/gi);

  if (linkMatch) {
    let targetLink = linkMatch[0];
    api.sendTypingIndicator(threadID);

    try {
      // 🔥 STEP 1: RESOLVE REDIRECT (404 FIX)
      // Ye hissa vt.tiktok ko asli link mein badal dega
      const headReq = await axios.head(targetLink, { maxRedirects: 5 });
      targetLink = headReq.request.res.responseUrl || targetLink;

      // 🔥 STEP 2: TRY MULTIPLE POWERFUL SERVERS
      const servers = [
        `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(targetLink)}`,
        `https://kaiz-apis.gleeze.com/api/video-downloader?url=${encodeURIComponent(targetLink)}`,
        `https://api.samir.site/download/aio?url=${encodeURIComponent(targetLink)}`
      ];

      let videoUrl = null;
      let title = "SARDAR RDX VIDEO";

      for (let server of servers) {
        try {
          const res = await axios.get(server, { timeout: 10000 });
          videoUrl = res.data.video || res.data.data?.video || res.data.result?.url || res.data.data?.play || res.data.url;
          if (videoUrl) {
            title = res.data.title || res.data.data?.title || title;
            break;
          }
        } catch (e) { continue; }
      }

      if (!videoUrl) return;

      // 🔥 STEP 3: RENDER SAFE DOWNLOAD
      const tempFile = path.join(os.tmpdir(), `rdx_v_${Date.now()}.mp4`);
      const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);

      return new Promise((resolve) => {
        writer.on('finish', async () => {
          const stats = fs.statSync(tempFile);
          if (stats.size > 26214400) { // 25MB Limit
            fs.unlinkSync(tempFile);
            return api.sendMessage("⚠️ Video 25MB se bari hai, FB limit!", threadID, messageID);
          }

          api.sendMessage({
            body: `🎬 **SARDAR RDX - 404 FIXED**\n✨ ${title}\n🦅 Aura: +9999`,
            attachment: fs.createReadStream(tempFile)
          }, threadID, () => {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          }, messageID);
          resolve();
        });
        writer.on("error", () => resolve());
      });

    } catch (err) {
      console.log("Global DL Error:", err.message);
    }
  }
};

module.exports.run = async () => {};
