/**
 * autoVideo.js - Premium RapidAPI (with Debugger)
 */

module.exports.config = {
  name: "autoVideo",
  version: "7.5.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Premium Downloader with Debugging Mode",
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
    const targetLink = linkMatch[0];
    api.sendTypingIndicator(threadID);

    const options = {
      method: 'GET',
      url: 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all',
      params: { url: targetLink },
      headers: {
        'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com'
      }
    };

    try {
      const res = await axios.request(options);
      
      // Check if API returned an error message in its own body
      if (res.data.status === false || !res.data.url) {
        return api.sendMessage(`❌ API Error: ${res.data.message || "Video not found on server."}`, threadID, messageID);
      }

      const videoUrl = res.data.url;
      const tempFile = path.join(os.tmpdir(), `rdx_p_${Date.now()}.mp4`);

      const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);

      return new Promise((resolve) => {
        writer.on('finish', async () => {
          api.sendMessage({
            body: `🎬 **SARDAR RDX - PREMIUM**\n✨ Status: Success\n🦅 Aura: +5000`,
            attachment: fs.createReadStream(tempFile)
          }, threadID, () => fs.unlinkSync(tempFile), messageID);
          resolve();
        });
      });

    } catch (err) {
      // 🕵️ Ye hissa aapko asli masla batayega
      let errorMsg = "❌ API Connection Failed.";
      if (err.response) {
        if (err.response.status === 401) errorMsg = "❌ API Key Invalid hai.";
        if (err.response.status === 403) errorMsg = "❌ Plan Subscribe nahi kiya ya Limit khatam ho gayi.";
        if (err.response.status === 404) errorMsg = "❌ API Host ya Endpoint badal gaya hai.";
      }
      console.log("Debug Error:", err.message);
      return api.sendMessage(errorMsg, threadID, messageID);
    }
  }
};

module.exports.run = async () => {};
