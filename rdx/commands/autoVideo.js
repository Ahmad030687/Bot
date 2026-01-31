/**
 * autoVideo.js - Premium RapidAPI (404 & Redirect Fixed)
 * Credits: Ahmad Ali Safdar
 */

module.exports.config = {
  name: "autoVideo",
  version: "13.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Fixed Premium Downloader for vt.tiktok links",
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
      // 🔥 SIGMA STEP: Resolve Redirect (vt.tiktok Fix)
      // Ye line link ko follow karegi taake asli URL mil jaye
      const resolve = await axios.head(targetLink, { maxRedirects: 5 });
      const finalUrl = resolve.request.res.responseUrl || targetLink;

      // 🚀 RapidAPI Premium Call
      const options = {
        method: 'GET',
        url: 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all',
        params: { url: finalUrl }, // Ab asli link API ko jayega
        headers: {
          'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
          'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com'
        }
      };

      const res = await axios.request(options);
      const videoUrl = res.data.url || (res.data.links && res.data.links[0]?.link);

      if (!videoUrl) throw new Error("API couldn't find video.");

      const tempFile = path.join(os.tmpdir(), `rdx_final_${Date.now()}.mp4`);
      const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);

      return new Promise((resolve) => {
        writer.on('finish', async () => {
          api.sendMessage({
            body: `🎬 **SARDAR RDX PREMIUM**\n✨ Status: Redirection Fixed\n🦅 Aura: +9999`,
            attachment: fs.createReadStream(tempFile)
          }, threadID, () => fs.unlinkSync(tempFile), messageID);
          resolve();
        });
      });

    } catch (err) {
      console.log("Download Fail:", err.message);
      // Backup for safety
      api.sendMessage("❌ Error: API ne link reject kiya ya video private hai.", threadID, messageID);
    }
  }
};

module.exports.run = async () => {};
