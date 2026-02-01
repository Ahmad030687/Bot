/**
 * ig.js - Sardar RDX Deep Scanner
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Scans every possible key for the download URL
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ig",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Advanced Instagram Downloader (No More Undefined)",
  commandCategory: "media",
  usages: "#ig [link]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const igUrl = args[0];

  if (!igUrl) return api.sendMessage("⚠️ Ahmad bhai, Link to dein!", threadID, messageID);

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Deep Scanning API Response...**", threadID);

  const options = {
    method: 'GET',
    url: 'https://instagram-video-image-downloader.p.rapidapi.com/igdl',
    params: { url: igUrl },
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'instagram-video-image-downloader.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // 🔥 DEBUGGING: Ahmad bhai, apne terminal/console mein check karein ke kya print ho raha hai
    console.log("--- RAW INSTA DATA ---");
    console.log(JSON.stringify(data, null, 2));

    // --- UNIVERSAL LINK FINDER ---
    // Ye logic har us key ko check karegi jahan Instagram link ho sakta hai
    let mediaUrl = "";

    if (data.links && data.links[0]) {
        mediaUrl = data.links[0].link || data.links[0].url;
    } else if (data.data && data.data[0]) {
        mediaUrl = data.data[0].url || data.data[0].link || data.data[0].download_url;
    } else if (data.url) {
        mediaUrl = data.url;
    } else if (data.result && data.result[0]) {
        mediaUrl = data.result[0].url;
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Ahmad bhai, API ne response diya par 'Link' nahi mila. Terminal mein 'RAW DATA' check karke mujhe dikhayein!", threadID, messageID);
    }

    // Download Logic
    const ext = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg";
    const filePath = path.join(__dirname, `/cache/ig_${Date.now()}${ext}`);
    
    const resStream = await axios.get(mediaUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    resStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐒𝐓𝐀**\n✨ Success: Media Found!`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Error: API Down hai ya Connection Limit khatam.", threadID, messageID);
  }
};
