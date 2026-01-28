const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "system",
  version: "20.0.0", // Final Version
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Clone anyone's voice using XTTS-v2 Neural Engine",
  commandCategory: "Professional",
  usages: "clone [text] (Reply to Audio)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const cmd = args[0]?.toLowerCase();
  const input = args.slice(1).join(" ");

  // 🛡️ Filter: Sirf 'clone' command par chalega
  if (cmd !== "clone") return; 

  // 1. Check: Voice note ko reply kiya hai ya nahi?
  if (!messageReply || !messageReply.attachments[0] || messageReply.attachments[0].type !== 'audio') {
    return api.sendMessage("⚠️ **System Alert:** Pehle kisi ki Voice Note ko reply karein!", threadID);
  }

  // 2. Check: Text likha hai ya nahi?
  if (!input) return api.sendMessage("📝 **System Alert:** Jo bulwana hai wo text likhein!\nExample: .system clone Ye Ahmad bhai ka ilaka hai!", threadID);

  api.setMessageReaction("🧬", messageID, () => {}, true);
  api.sendMessage(`🧬 **Neural Engine Active:** Cloning Voice Pattern...\nTarget: [User Audio]\n⏳ Processing...`, threadID);

  try {
    const audioUrl = messageReply.attachments[0].url;
    
    // 🔥 THE POWER API (XTTS-v2)
    // Ye API direct Hugging Face models se connect karti hai.
    // 'Beast' server bohot stable hai aur lambi cloning support karta hai.
    const apiUrl = `https://api.kenliejugarap.com/beast-voice-clone/?url=${encodeURIComponent(audioUrl)}&text=${encodeURIComponent(input)}`;

    const p = path.join(__dirname, 'cache', `cloned_${Date.now()}.mp3`);
    
    // Stream Logic (Unlimited Minutes Support)
    const response = await axios({
        method: 'GET',
        url: apiUrl,
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(p);
    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `👤 **Voice Identity Cloned**\n━━━━━━━━━━━━━━━━━━\n🗣️ **Model:** XTTS-v2 (High Fidelity)\n🧠 **Engine:** Ahmad Neural Core\n━━━━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(p)
      }, threadID, () => {
          // Cache clear karein taake storage na bhare
          fs.unlinkSync(p);
      });
    });

    writer.on('error', (err) => {
        api.sendMessage("❌ **Stream Error:** Audio download mein masla hua.", threadID);
    });

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ **Neural Overload:** Server abhi heavy load par hai. 1 minute baad try karein.", threadID);
  }
};
