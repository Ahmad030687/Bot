/**
 * qrcode.js - Professional QR Generator
 * Credits: Ahmad Ali Safdar
 * Engine: Dub.co API
 */

module.exports.config = {
  name: "qr",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Generate Premium QR Codes for any Link or Text",
  commandCategory: "tools",
  usages: "qr [link/text]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const content = args.join(" ");
  if (!content) return api.sendMessage("⚠️ Ahmad bhai, koi link ya text to likhein! (e.g. #qr https://facebook.com)", threadID, messageID);

  api.sendMessage("⏳ Premium QR Code generate ho raha hai...", threadID, messageID);

  try {
    // 🔥 Dub.co QR Engine (No Key Required for basic usage)
    // Ismein hum logo aur colors bhi customize kar sakte hain
    const qrUrl = `https://api.dub.co/qr?url=${encodeURIComponent(content)}&size=600&level=H`;

    const tempPath = path.join(__dirname, `/cache/qr_${Date.now()}.png`);
    
    const response = await axios({
      url: qrUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **SARDAR RDX QR GENERATOR**\n✨ Content: ${content}\n📄 Quality: 600x600 (High)`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }, messageID);
        resolve();
      });
      writer.on('error', resolve);
    });

  } catch (e) {
    return api.sendMessage("❌ Error: QR Code generate nahi ho saka.", threadID, messageID);
  }
};

