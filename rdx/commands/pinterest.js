const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Pinterest Image Downloader (Fixed for 2026)",
  commandCategory: "Media",
  usages: "[query] [quantity]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  let query = args.join(" ");
  
  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  if (!query) return api.sendMessage(`${rdx_header}\n${line}\n⚠️ Ahmad bhai, kya dhoondna hai?\nExample: #pinterest cat 5`, threadID, messageID);

  // Quantity Logic
  let quantity = 1;
  const lastArg = args[args.length - 1];
  if (!isNaN(lastArg) && args.length > 1) {
    quantity = parseInt(lastArg);
    query = args.slice(0, -1).join(" ");
    if (quantity > 10) quantity = 10;
    if (quantity < 1) quantity = 1;
  }

  api.sendMessage(`🔍 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 is searching for "${query}"...`, threadID, messageID);

  try {
    const res = await axios.get(`https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(query)}&apikey=freeApikey`);
    
    // JSON Structure ke mutabiq results nikalna
    const results = res.data.data.result; 
    
    if (!results || results.length === 0) {
      return api.sendMessage("❌ Ahmad bhai, koi image nahi mili!", threadID, messageID);
    }

    const attachments = [];
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    // Randomize results
    const shuffled = results.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, quantity);

    for (let i = 0; i < selected.length; i++) {
      // 🦅 Sab se heavy quality (736x) ka link uthana
      const imgUrl = selected[i].images["736x"].url;
      const imgPath = path.join(cacheDir, `rdx_pin_${Date.now()}_${i}.jpg`);
      
      try {
        const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(imgRes.data));
        attachments.push(fs.createReadStream(imgPath));
      } catch (e) {
        console.log(`Download Error: ${e.message}`);
      }
    }

    if (attachments.length === 0) {
      return api.sendMessage("❌ Images fetch karne mein masla hua!", threadID, messageID);
    }

    return api.sendMessage({
      body: `${rdx_header}\n${line}\n✅ Results for: ${query}\n📸 Images: ${attachments.length}\n${line}`,
      attachment: attachments
    }, threadID, () => {
      // Cleanup
      attachments.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }, messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ API Error! Shayad server down hai.", threadID, messageID);
  }
};
