/**
 * tikAuto.js - Automatic TikTok Downloader
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Auto-detects TikTok links in any message
 */

module.exports.config = {
  name: "tikAuto",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Automatically downloads TikTok videos from links",
  commandCategory: "events",
  usages: "Just send a TikTok link",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, body } = event;

  // 1. TikTok Link Detect karne ka Regex
  const tikTokLinkPattern = /https?:\/\/(www\.|v[mt]\.)?tiktok\.com\/[\w\.-]+\/?\S*/g;
  const match = body?.match(tikTokLinkPattern);

  if (match) {
    const url = match[0];
    api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Auto-Download Start...**", threadID);

    try {
      // 🍪 Ahmad Ali Bhai ki Cookies (Anti-Block)
      const myCookies = "tt_csrf_token=m7WbJxOP-sSzn8pmFK4W1ZwjVbKA5gRTzPXo; ttwid=1%7C1wELVcxL4ClaheuKKmTNu_1R_f9mk18OWFVb7VlH5xQ%7C1769936826%7Ce7563e239d088b9f63235ff785be373b4172f316c7f406466559e9f031838b41; msToken=RrxaYTHZDKZaqne2p935r3fJ4zzWKha-pgoNFLSNMSVzuoT01MQMArtsiPHCf1sOXMfCHbeKZw3ohH8PRH36yGaftjn9GdDQC9XTzWfKVc2XjsTeE0XzwEEbnFY9ZnUce9HsgBvuw_6hZCt6Hl3_1Upy";

      // 🚀 High-Speed API (Watermark free)
      const res = await axios.get(`https://api.tikwm.com/api/?url=${url}`, {
        headers: { "Cookie": myCookies }
      });

      const videoData = res.data.data;
      const videoUrl = videoData.play; // Without Watermark
      const title = videoData.title || "No Title";

      const path = __dirname + `/cache/tik_${Date.now()}.mp4`;
      const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(path, Buffer.from(vidRes.data, "binary"));

      return api.sendMessage({
        body: `🦅 **SARDAR RDX AUTO-TIKTOK**\n📝 Title: ${title}\n👤 User: ${videoData.author.nickname}`,
        attachment: fs.createReadStream(path)
      }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (e) {
      console.log(e);
      // api.sendMessage("❌ Error: Video download nahi ho saki.", threadID);
    }
  }
};

module.exports.run = async ({ api, event }) => {
   // Empty run function kyunki ye event base hai
};
