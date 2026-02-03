const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "find",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Dynamic Image Finder (e.g. #find car 6pics)",
  commandCategory: "utility",
  usages: "[search] [number]pics",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  let input = args.join(" ");

  if (!input) return api.sendMessage("⚠️ Ahmad bhai, example: #find karan aujla 6pics", threadID, messageID);

  // 🛡️ REGEX: User ki request se number nikalna (e.g. 6pics)
  let count = 1; 
  const picMatch = input.match(/(\d+)pics/i);
  
  if (picMatch) {
    count = parseInt(picMatch[1]);
    input = input.replace(picMatch[0], "").trim(); // "karan aujla 6pics" -> "karan aujla"
  }

  // Messenger aik sath 10 se zyada images nahi bhej sakta
  if (count > 10) count = 10;

  const API_URL = `https://image-api-j3zy.onrender.com/find-img?q=${encodeURIComponent(input)}&count=${count}`;

  api.sendMessage(`🔍 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗**\n'${input}' ki ${count} pictures nikaal raha hoon...`, threadID, messageID);

  try {
    const res = await axios.get(API_URL);
    const { status, data: images } = res.data;

    if (!status || !images || images.length === 0) {
      return api.sendMessage("❌ Kuch nahi mila Ahmad bhai!", threadID, messageID);
    }

    const attachments = [];
    const cachePaths = [];
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // Download Loop
    for (let i = 0; i < images.length; i++) {
      const filePath = path.join(cacheDir, `rdx_${Date.now()}_${i}.jpg`);
      try {
        const imgRes = await axios({ url: images[i].url, method: 'GET', responseType: 'stream', timeout: 15000 });
        const writer = fs.createWriteStream(filePath);
        imgRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        attachments.push(fs.createReadStream(filePath));
        cachePaths.push(filePath);
      } catch (e) { console.log("Ek image fail hui, skip kar rahe hain."); }
    }

    // Saari images aik sath bhejna
    if (attachments.length > 0) {
      api.sendMessage({
        body: `🖼️ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐄𝐓**\n━━━━━━━━━━━━━━\n🔎 **Search:** ${input}\n✨ **Results:** ${attachments.length} Images`,
        attachment: attachments
      }, threadID, () => {
        cachePaths.forEach(p => { if(fs.existsSync(p)) fs.unlinkSync(p); });
      }, messageID);
    } else {
      api.sendMessage("❌ Images download nahi ho sakein.", threadID, messageID);
    }

  } catch (e) {
    api.sendMessage("❌ API Server Response nahi de raha.", threadID, messageID);
  }
};
