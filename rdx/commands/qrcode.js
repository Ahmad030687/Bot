/**
 * qrcode.js - Ultra Stable QR Generator
 * Credits: Ahmad Ali Safdar
 */

module.exports.config = {
  name: "qr",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "High-Speed QR Code Generator",
  commandCategory: "tools",
  usages: "qr [text/link]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const content = args.join(" ");
  if (!content) return api.sendMessage("⚠️ Ahmad bhai, link to likhein!", threadID, messageID);

  api.sendTypingIndicator(threadID);

  try {
    // 🚀 STABLE ENGINE: Google Charts API (100% Uptime & Fast)
    const qrUrl = `https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${encodeURIComponent(content)}&choe=UTF-8`;

    const tempPath = path.join(__dirname, `/cache/qr_${Date.now()}.png`);
    const response = await axios({ url: qrUrl, method: 'GET', responseType: 'stream' });
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **SARDAR RDX QR GENERATOR**\n✅ Status: Success\n🔍 Content: ${content}`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => fs.unlinkSync(tempPath), messageID);
        resolve();
      });
    });

  } catch (e) {
    // Fallback Engine: Agar Google fail ho (Jo ke namumkin hai)
    return api.sendMessage("❌ Server busy hai, dobara try karein.", threadID, messageID);
  }
};
