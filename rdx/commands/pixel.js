module.exports.config = {
  name: "pixels",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Search HD Photos & Videos from Pexels",
  commandCategory: "graphics",
  usages: "pixels [query] or pixels video [query]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const apiKey = "ize17V6ET10t0sgwBcoLqwiNSsxxTiJ3Lz6cf8lo3xlVbKDNvOjKFX6W";
  
  if (args.length == 0) return api.sendMessage("⚠️ Kya dhoondna hai Ahmad bhai? (e.g. #pixels nature)", threadID, messageID);

  const isVideo = args[0].toLowerCase() === "video";
  const query = isVideo ? args.slice(1).join(" ") : args.join(" ");

  api.sendMessage(`⏳ Pexels se ${isVideo ? "Video" : "Photo"} nikaali ja rahi hai...`, threadID, messageID);

  try {
    const endpoint = isVideo 
      ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1`
      : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;

    const res = await axios.get(endpoint, {
      headers: { 'Authorization': apiKey }
    });

    const data = isVideo ? res.data.videos[0] : res.data.photos[0];
    if (!data) return api.sendMessage("❌ Kuch nahi mila boss!", threadID, messageID);

    const mediaUrl = isVideo ? data.video_files[0].link : data.src.large2x;
    const ext = isVideo ? ".mp4" : ".jpg";
    const tempPath = path.join(__dirname, `/cache/pexels_${Date.now()}${ext}`);

    const mediaData = (await axios.get(mediaUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(tempPath, Buffer.from(mediaData, "utf-8"));

    return api.sendMessage({
      body: `🦅 **SARDAR RDX - PEXELS ${isVideo ? "VIDEO" : "HD"}**\n🔍 Query: ${query}\n✨ Quality: Premium`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (e) {
    return api.sendMessage("❌ API Error: Pexels server respond nahi kar raha.", threadID, messageID);
  }
};

