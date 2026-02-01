/**
 * find.js - Pinterest Official API Random Finder
 * Logic: Uses Pinterest v5 API with Personal Access Token
 */

module.exports.config = {
  name: "find",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Sardar RDX",
  description: "Official Pinterest Image Finder",
  commandCategory: "tools",
  usages: "find [query]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const query = args.join(" ");
  if (!query) return api.sendMessage("⚠️ Bhai, search karne ke liye kuch likhein! (e.g. #find R34 Skyline)", threadID, messageID);

  // 🔥 AAPKA PINTEREST ACCESS TOKEN
  const ACCESS_TOKEN = "pina_AMAULEYXABWNCBIAGCAOKD2XLDXBTHABQBIQDUWVLCSRRI5OP5MD6C725IHJFAIEJ5NKHWSIOAO3WNTYPDQLDEKMUK2EP3IA";

  api.sendMessage(`🔍 Pinterest se **"${query}"** ki HD photos nikaali ja rahi hain...`, threadID, messageID);

  try {
    // 🚀 Official Pinterest API v5 Search Endpoint
    const response = await axios.get(`https://api.pinterest.com/v5/search/pins?query=${encodeURIComponent(query)}&max_results=25`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const pins = response.data.items;

    if (!pins || pins.length === 0) {
      return api.sendMessage("❌ Is query par koi images nahi milin. Kuch aur try karein.", threadID, messageID);
    }

    // 🎲 RANDOM LOGIC: Har baar 25 results mein se random selection
    const randomPin = pins[Math.floor(Math.random() * pins.length)];
    const imageUrl = randomPin.media.images['736x'].url; // High resolution image

    const tempPath = path.join(__dirname, `/cache/pin_${Date.now()}.jpg`);
    const imgData = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(tempPath, Buffer.from(imgData, 'binary'));

    return api.sendMessage({
      body: `🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 - Pinterest PRO**\n✅ Search: ${query}\n📌 Title: ${randomPin.title || "Pinterest Pin"}`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
    // Agar API fail ho jaye (Rate limit ya token issue), to purana fallback engine chalega
    return api.sendMessage("❌ Pinterest API busy hai ya token expire ho gaya hai. Thori der baad try karein.", threadID, messageID);
  }
};

