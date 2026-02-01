/**
 * qrcode.js - Sardar RDX Hybrid QR Engine
 * Credits: Ahmad Ali Safdar
 */

module.exports.config = {
  name: "qr",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "High-Speed Hybrid QR Generator",
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
  if (!content) return api.sendMessage("⚠️ Ahmad bhai, kuch likhein to sahi! e.g. #qr Ahmad Ali", threadID, messageID);

  api.sendTypingIndicator(threadID);
  const tempPath = path.join(__dirname, `/cache/qr_rdx_${Date.now()}.png`);

  // 🚀 PRIMARY ENGINE: Google Charts
  let qrUrl = `https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${encodeURIComponent(content)}&choe=UTF-8`;

  try {
    let response = await axios({ url: qrUrl, method: 'GET', responseType: 'stream' });
    
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **SARDAR RDX QR GENERATOR**\n✅ Engine: Stable-v3\n🔍 Content: ${content}`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }, messageID);
        resolve();
      });
      
      writer.on('error', async () => {
        // 🔄 FALLBACK ENGINE: Qrickit (Agar Google fail ho jaye)
        console.log("Switching to Qrickit...");
        const backupUrl = `https://qrickit.com/api/qr.php?d=${encodeURIComponent(content)}&addtext=RDX&txtcolor=000000&fgdcolor=000000&bgdcolor=FFFFFF&qrsize=500`;
        const backupRes = await axios({ url: backupUrl, method: 'GET', responseType: 'stream' });
        backupRes.data.pipe(fs.createWriteStream(tempPath));
        // ... (Same send logic)
      });
    });

  } catch (e) {
    return api.sendMessage("❌ Ahmad bhai, dono APIs down hain. Internet check karein.", threadID, messageID);
  }
};
