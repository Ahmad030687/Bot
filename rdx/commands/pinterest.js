const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pinterest",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Search images on Pinterest",
  commandCategory: "Media",
  usages: "[query] [quantity (optional)]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  
  // 🦅 RDX Header
  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  if (!query) return api.sendMessage(`${rdx_header}\n${line}\n⚠️ Ahmad bhai, kya search karun?\nExample: #pinterest cat 5`, threadID, messageID);

  // Check if last argument is a number (quantity)
  let quantity = parseInt(args[args.length - 1]);
  let searchQuery = query;

  if (!isNaN(quantity)) {
    searchQuery = args.slice(0, -1).join(" ");
    if (quantity > 10) quantity = 10; // Max 10 limit
    if (quantity < 1) quantity = 1;
  } else {
    quantity = 1; // Default 1 image
  }

  api.sendMessage(`🔍 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 Searching for "${searchQuery}"...`, threadID, messageID);

  try {
    const res = await axios.get(`https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(searchQuery)}&apikey=freeApikey`);
    
    // API Check
    if (!res.data || !res.data.result || res.data.result.length === 0) {
      return api.sendMessage("❌ Ahmad bhai, koi image nahi mili!", threadID, messageID);
    }

    const results = res.data.result;
    const attachments = [];
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // Randomize results takay har bar new image aye
    const shuffled = results.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, quantity);

    for (let i = 0; i < selected.length; i++) {
      const imgUrl = selected[i];
      const imgPath = path.join(cacheDir, `rdx_pin_${Date.now()}_${i}.jpg`);
      const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(imgRes.data));
      attachments.push(fs.createReadStream(imgPath));
    }

    return api.sendMessage({
      body: `${rdx_header}\n${line}\n✅ Found ${quantity} images for "${searchQuery}"\n${line}`,
      attachment: attachments
    }, threadID, () => {
      // Cleanup cache
      attachments.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }, messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Pinterest API down hai ya server error!", threadID, messageID);
  }
};
