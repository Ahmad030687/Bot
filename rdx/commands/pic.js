/**
 * pic.js - Official Unsplash Random Image Finder
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Uses official API keys for 100% stability and HD quality.
 */

module.exports.config = {
  name: "pic",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Get HD random images from Unsplash Official",
  commandCategory: "media",
  usages: "#pic [query]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const query = args.join(" ");
  if (!query) return api.sendMessage("⚠️ Ahmad bhai, search ke liye kuch likhein! (e.g. #pic luxury car)", threadID, messageID);

  // 🔥 AAPKI OFFICIAL KEYS
  const ACCESS_KEY = "Qx0SVJ2CM_1TPTUNJEwRczhqOdc8wz774bWGofpxGA4";

  api.sendMessage(`🔍 Unsplash library se **"${query}"** ki HD photo talash ki ja rahi hai...`, threadID);

  try {
    // 🚀 Unsplash Random Endpoint: Har baar nayi image guaranteed!
    const res = await axios.get(`https://api.unsplash.com/photos/random`, {
      params: {
        query: query,
        client_id: ACCESS_KEY,
        orientation: "landscape", // Aap "portrait" bhi kar sakte hain
        featured: true // Sirf best quality images ke liye
      }
    });

    const imageUrl = res.data.urls.regular; // HD URL
    const photographer = res.data.user.name;

    const tempPath = path.join(__dirname, `/cache/unsplash_${Date.now()}.jpg`);
    const imgData = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(tempPath, Buffer.from(imgData, 'binary'));

    return api.sendMessage({
      body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - 𝐔𝐍𝐒𝐏𝐋𝐀𝐒𝐇 𝐏𝐑𝐎**\n✅ Search: ${query}\n📸 Photographer: ${photographer}\n✨ Status: Fresh Official Result`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    
    // Agar specific search na mile to error message
    if (err.response && err.response.status === 404) {
        return api.sendMessage(`❌ Ahmad bhai, Unsplash par "${query}" ki koi HD photo nahi mili. Try: Nature, Tech, Cars.`, threadID, messageID);
    }
    
    return api.sendMessage("❌ Unsplash API limit ya connection ka masla hai. Thori der baad try karein.", threadID, messageID);
  }
};
