/**
 * aio.js - Sardar RDX Universal Downloader (POST Engine)
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: POST with x-www-form-urlencoded (High Stability)
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "aio",
  version: "12.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Download Any Video (POST Method)",
  commandCategory: "media",
  usages: "#aio [link]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!link) {
    return api.sendMessage("⚠️ Ahmad bhai, koi link to dein!\nUsage: #aio [link]", threadID, messageID);
  }

  api.sendMessage("📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - POST Engine se video fetch ho rahi hai...**", threadID);

  // 🛠️ POST Data tayyar karna
  const encodedParams = new URLSearchParams();
  encodedParams.append('url', link); // Aapka bheja hua link yahan fit hoga

  const options = {
    method: 'POST',
    url: 'https://best-all-in-one-video-downloader5.p.rapidapi.com/index.php',
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'best-all-in-one-video-downloader5.p.rapidapi.com',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: encodedParams
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // console.log("Full Response:", JSON.stringify(data, null, 2)); // Debugging ke liye

    // --- DATA EXTRACTION ---
    // POST APIs aksar 'result.url' ya 'links' ke andar HD URL deti hain
    const videoUrl = data.url || 
                     (data.result && data.result.url) || 
                     (data.links && data.links[0]?.url) ||
                     data.hd_url;

    if (!videoUrl) {
      return api.sendMessage("❌ Ahmad bhai, API ne response to diya par video link nahi mila. Post public honi chahiye!", threadID, messageID);
    }

    // --- DOWNLOAD & SEND ---
    const filePath = path.join(__dirname, `/cache/aio_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoStream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream'
    });

    videoStream.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐔𝐍𝐈𝐕𝐄𝐑𝐒𝐀𝐋**\n✨ Engine: POST Stable`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Ahmad bhai, server ne link reject kar diya. Doosra link try karein.", threadID, messageID);
  }
};
