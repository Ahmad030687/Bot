/**
 * ig.js - Sardar RDX Hybrid Downloader
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Fix: Forced Video Extraction & 404 Failover
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ig",
  version: "15.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download IG Reels (Bypasses 404 & Thumbnail-only issues)",
  commandCategory: "media",
  usages: "#ig [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const igUrl = args[0];

  if (!igUrl) return api.sendMessage("⚠️ Ahmad bhai, Reel link to dein!", threadID, messageID);

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Engine Booting (Strict Video Mode)...**", threadID);

  const cookies = "csrftoken=bGIDVDupMveNybZtdUnEtI; datr=uSKAadyUYea0BpWZdtL4f9Kx; ig_did=731C0210-4E78-4A23-B215-71BA1C49BF92; mid=aYAiuQABAAFPO0HzHIr7I-YaiHNX";

  try {
    // --- STEP 1: PRIMARY ENGINE (RapidAPI + Cookies) ---
    const res = await axios.get('https://instagram-video-image-downloader.p.rapidapi.com/igdl', {
      params: { url: igUrl },
      headers: {
        'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
        'x-rapidapi-host': 'instagram-video-image-downloader.p.rapidapi.com',
        'Cookie': cookies
      }
    });

    let mediaUrl = "";
    const results = res.data;

    // --- STRICT VIDEO FILTER ---
    // Hum sirf wo link uthayenge jis mein '.mp4' ho ya size bada ho
    if (Array.isArray(results)) {
        const videoObj = results.find(item => item.url.includes(".mp4") || item.filename?.includes(".mp4"));
        mediaUrl = videoObj ? videoObj.url : results[0]?.url;
    } else {
        mediaUrl = results.url || results.download_url;
    }

    // --- STEP 2: FALLBACK ENGINE (If Step 1 fails or returns thumbnail) ---
    if (!mediaUrl || !mediaUrl.includes(".mp4")) {
      console.log("RapidAPI failed/returned image. Switching to Backup Engine...");
      const backup = await axios.get(`https://api.vkrhost.xyz/api/v1/instagram?url=${encodeURIComponent(igUrl)}`);
      mediaUrl = backup.data.result?.[0]?.url;
    }

    if (!mediaUrl) throw new Error("No video link found in any engine.");

    // --- STEP 3: PROTECTED DOWNLOADER ---
    const filePath = path.join(__dirname, `/cache/ig_rdx_${Date.now()}.mp4`);
    
    const videoStream = await axios({
      url: mediaUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        'Referer': 'https://www.instagram.com/',
        'Cookie': cookies
      }
    });

    const writer = fs.createWriteStream(filePath);
    videoStream.data.pipe(writer);

    writer.on('finish', () => {
      const stats = fs.statSync(filePath);
      // Agar file bohot choti hai (Thumbnail), to failover trigger karein
      if (stats.size < 100000) { 
          fs.unlinkSync(filePath);
          return api.sendMessage("❌ Thumbnail block! Instagram video access nahi de raha.", threadID, messageID);
      }

      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✨ Engine: Hybrid Failover Active`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (err) {
    console.error(err.message);
    api.sendMessage("❌ 404 Not Found: Instagram CDN ne bot ko block kar diya hai.", threadID, messageID);
  }
};
