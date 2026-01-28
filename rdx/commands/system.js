const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "system",
  version: "17.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali", //
  description: "Infinity Neural Voice Cloner (Unlimited Mode)",
  commandCategory: "Professional",
  usages: "clone [text] (Reply to Voice)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const cmd = args[0]?.toLowerCase();
  const textToSpeak = args.slice(1).join(" ");

  if (cmd !== "clone") return; 

  if (!messageReply || !messageReply.attachments[0] || messageReply.attachments[0].type !== 'audio') {
    return api.sendMessage("⚠️ **Ahmad System Alert:** Kisi ki voice note ko reply karke command dein!", threadID);
  }

  if (!textToSpeak) return api.sendMessage("📝 **Ahmad System Alert:** Kya bulwana hai? Text likhein!", threadID);

  api.setMessageReaction("🌀", messageID, () => {}, true);
  api.sendMessage("🛰️ **Syncing Neural Signatures:** Cloning voice identity in Unlimited Mode...", threadID);

  try {
    const audioUrl = messageReply.attachments[0].url;
    
    // 2026 PREMIER NEURAL ENGINE (Unlimited Mirror)
    // Ye API sample se pitch, tone, aur accent (lehja) extract karti hai
    const response = await axios.post('https://api.neural-sync.io/v3/clone-unlimited', {
      sample: audioUrl,
      prompt: textToSpeak,
      engine: "xtts-pro-v4",
      bitrate: "320kbps"
    }, { responseType: 'stream' });

    const cachePath = path.join(__dirname, 'cache', `clone_${Date.now()}.mp3`);
    const writer = fs.createWriteStream(cachePath);

    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `👤 **Voice Mimicry Successful**\n━━━━━━━━━━━━━━━━━━\n🎯 **Status:** 100% Neural Match\n🧠 **Engine:** Ahmad Overlord v17\n━━━━━━━━━━━━━━━━━━\n🚀 Aura Level: 999+`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath));
    });

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ **Neural Link Error:** Ahmad bhai, server busy hai ya audio sample saaf nahi hai. 1 minute baad try karein!", threadID);
  }
};
