/**
 * download.js — SARDAR RDX Downloader Engine
 * Engine: yt-dlp (Local)
 * Author: Ahmad Ali Safdar
 * No API | No Limit | 2026 Ready
 */

const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "download",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Universal Video Downloader (yt-dlp)",
  commandCategory: "tools",
  usages: "download <video link>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url)
    return api.sendMessage(
      "⚠️ Ahmad bhai, link to do!\nExample:\n#download https://youtu.be/xxxx",
      threadID,
      messageID
    );

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

  api.sendTypingIndicator(threadID);

  const cmd = `yt-dlp -f mp4 -o "${filePath}" "${url}"`;

  exec(cmd, { timeout: 120000 }, async (err) => {
    if (err || !fs.existsSync(filePath)) {
      return api.sendMessage(
        "❌ Download temporarily unavailable.\nTry again later.",
        threadID,
        messageID
      );
    }

    api.sendMessage(
      {
        body: "🦅 **SARDAR RDX DOWNLOADER**\n✅ Engine: yt-dlp\n📥 Status: Success",
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );
  });
};
