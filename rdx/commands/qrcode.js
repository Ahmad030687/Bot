/**
 * qrcode.js - Sardar RDX QR Engine (Single API)
 * Credits: Ahmad Ali Safdar
 */

module.exports.config = {
  name: "qr",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Fast & Stable QR Generator (Single Engine)",
  commandCategory: "tools",
  usages: "qr [text/link]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  const content = args.join(" ").trim();
  if (!content) {
    return api.sendMessage(
      "⚠️ QR banane ke liye text ya link likhein.\nExample: #qr Ahmad Ali",
      threadID,
      messageID
    );
  }

  api.sendTypingIndicator(threadID);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const tempPath = path.join(cacheDir, `qr_${Date.now()}.png`);

  // ✅ SINGLE, STABLE API
  const qrURL = `https://qrickit.com/api/qr.php?d=${encodeURIComponent(content)}&qrsize=500`;

  try {
    const res = await axios({
      url: qrURL,
      method: "GET",
      responseType: "stream",
      timeout: 15000
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(tempPath);
      res.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    api.sendMessage(
      {
        body:
          `🦅 𝐀𝐇𝐌𝐀𝐃 RDX QR GENERATOR\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📌 Content:\n${content}`,
        attachment: fs.createReadStream(tempPath)
      },
      threadID,
      () => {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      },
      messageID
    );

  } catch (e) {
    // Minimal, professional error (no API exposure)
    return api.sendMessage(
      "❌ QR generate nahi ho saka. Thori dair baad try karein.",
      threadID,
      messageID
    );
  }
};
